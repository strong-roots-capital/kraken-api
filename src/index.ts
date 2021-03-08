/**
 * kraken-api
 * TypeScript library for the Kraken Cryptocurrency Exchange API
 */

import * as crypto from 'crypto'
import got from 'got'
import { stringify } from 'qs'
import { TimeResponse } from './codecs/TimeResponse'

import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import * as R from 'fp-ts/Record'
import * as TE from 'fp-ts/TaskEither'
import * as PathReporter from 'io-ts/lib/PathReporter'
import { pipe, flow } from 'fp-ts/function'
import { BalanceResponse } from './codecs/BalanceResponse'
import { StringifiedJson } from './codecs/StringifiedJson'

// Create a signature for a request
const getMessageSignature = (
    path: string,
    // TODO: type better
    request: Record<string, unknown>,
    secret: string,
    nonce: number,
) => {
    const message = stringify(request)
    const secret_buffer = Buffer.from(secret, 'base64')
    const hash = crypto.createHash('sha256')
    const hmac = crypto.createHmac('sha512', secret_buffer)
    // FIXME: I have no idea how to use Buffers appropriately in the
    // latest node versions, but this janky af and relying on legacy
    // behaviors that we should not assume will last
    const hash_digest = hash
        .update(nonce.toString() + message)
        .digest(('binary' as unknown) as crypto.BinaryToTextEncoding)
    const hmac_digest = hmac
        .update(path + hash_digest, 'binary')
        .digest('base64')
    return hmac_digest
}

// Send an API request
const rawRequest = async (
    url: string,
    // TODO: type better
    headers: Record<string, unknown>,
    // TODO: type better
    data: Record<string, unknown>,
    timeout: number,
): Promise<unknown> => {
    // Set custom User-Agent string
    headers['User-Agent'] = 'Kraken Javascript API Client'

    const options = { headers, timeout }

    Object.assign(options, {
        method: 'POST',
        body: stringify(data),
    })

    // TODO: remove as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await got(url, options as any).then(({ body }) => body)
}

type KrakenClientConfig = {
    key: string
    secret: string
    version: number
    url: string
    requestTimeoutMS: number
}

const defaultKrakenClientConfig: Omit<KrakenClientConfig, 'key' | 'secret'> = {
    version: 0,
    url: 'https://api.kraken.com',
    requestTimeoutMS: 5000,
}

const Empty = t.undefined

type KrakenApiEndpoint<A extends t.Mixed, B extends t.Mixed> = {
    request?: A
    response: B
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type KrakenApiEndpointRequest<T> = T extends KrakenApiEndpoint<infer A, infer B>
    ? t.TypeOf<A>
    : never
type KrakenApiEndpointResponse<T> = T extends KrakenApiEndpoint<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer A,
    infer B
>
    ? t.TypeOf<B>
    : never

const PublicApi = {
    Time: {
        request: Empty,
        response: TimeResponse,
    },
    // 'Assets',
    // 'AssetPairs',
    // 'Ticker',
    // 'Depth',
    // 'Trades',
    // 'Spread',
    // 'OHLC',
} as const
type PublicApi = typeof PublicApi

const PrivateApi = {
    Balance: {
        // FIXME: this is stubbed, there are actually parameters
        request: Empty,
        response: BalanceResponse,
    },
    // 'TradeBalance',
    // 'OpenOrders',
    // 'ClosedOrders',
    // 'QueryOrders',
    // 'TradesHistory',
    // 'QueryTrades',
    // 'OpenPositions',
    // 'Ledgers',
    // 'QueryLedgers',
    // 'TradeVolume',
    // 'AddOrder',
    // 'CancelOrder',
    // 'DepositMethods',
    // 'DepositAddresses',
    // 'DepositStatus',
    // 'WithdrawInfo',
    // 'Withdraw',
    // 'WithdrawStatus',
    // 'WithdrawCancel',
    // 'GetWebSocketsToken',
} as const
type PrivateApi = typeof PrivateApi

type KrakenClient = {
    [A in keyof PublicApi]: (
        request?: KrakenApiEndpointRequest<PublicApi[A]>,
    ) => TE.TaskEither<Error, KrakenApiEndpointResponse<PublicApi[A]>>
} &
    {
        [A in keyof PrivateApi]: (
            request?: KrakenApiEndpointRequest<PrivateApi[A]>,
        ) => TE.TaskEither<Error, KrakenApiEndpointResponse<PrivateApi[A]>>
    }

const decodeResponse = <A extends t.Mixed>(responseCodec: A) =>
    flow(
        StringifiedJson(responseCodec).decode.bind(null),
        E.mapLeft(
            flow(
                (errors) => PathReporter.failure(errors).join('\n'),
                E.toError,
            ),
        ),
        TE.fromEither,
    )

// TODO: make the key|secret optional and only return the public endpoints
export const krakenClient = (
    clientConfig: Partial<KrakenClientConfig> &
        Pick<KrakenClientConfig, 'key' | 'secret'>,
): KrakenClient => {
    const config = Object.assign({}, defaultKrakenClientConfig, clientConfig)

    const publicApi = pipe(
        PublicApi,
        R.mapWithIndex(
            (apiMethod, { request: requestCodec, response: responseCodec }) => (
                request: t.TypeOf<typeof requestCodec>,
            ): TE.TaskEither<Error, t.TypeOf<typeof responseCodec>> =>
                pipe(
                    TE.tryCatch(
                        async () =>
                            rawRequest(
                                `${config.url}/${config.version}/public/${apiMethod}`,
                                {},
                                request ?? {},
                                config.requestTimeoutMS,
                            ),
                        E.toError,
                    ),
                    TE.chain(decodeResponse(responseCodec)),
                ),
        ),
    )

    const privateApi = pipe(
        PrivateApi,
        R.mapWithIndex(
            (apiMethod, { request: requestCodec, response: responseCodec }) => (
                request: t.TypeOf<typeof requestCodec>,
            ): TE.TaskEither<Error, t.TypeOf<typeof responseCodec>> =>
                pipe(
                    TE.tryCatch(async () => {
                        const path = `/${config.version}/private/${apiMethod}`
                        const url = config.url + path

                        const request_ = Object.assign(
                            {
                                nonce: new Date().getTime() * 1000, // spoof microsecond,
                            },
                            request ?? {},
                        )

                        const signature = getMessageSignature(
                            path,
                            request_,
                            config.secret,
                            request_.nonce,
                        )

                        const headers = {
                            'API-Key': config.key,
                            'API-Sign': signature,
                        }

                        return rawRequest(
                            url,
                            headers,
                            request_,
                            config.requestTimeoutMS,
                        )
                    }, E.toError),
                    TE.chain(decodeResponse(responseCodec)),
                ),
        ),
    )

    return Object.assign({}, publicApi, privateApi)
}
