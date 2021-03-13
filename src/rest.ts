/**
 * kraken-api
 * TypeScript library for the Kraken Cryptocurrency Exchange API
 */

import * as crypto from 'crypto'
import got from 'got'
import { stringify } from 'qs'

import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import * as R from 'fp-ts/Record'
import * as TE from 'fp-ts/TaskEither'
import * as PathReporter from 'io-ts/lib/PathReporter'
import { pipe, flow, Endomorphism, identity } from 'fp-ts/function'

import { AddOrderRequest } from './rest-codecs/AddOrderRequest'
import { AddOrderResponse } from './rest-codecs/AddOrderResponse'
import { BalanceRequest } from './rest-codecs/BalanceRequest'
import { BalanceResponse } from './rest-codecs/BalanceResponse'
import { GetWebSocketsTokenRequest } from './rest-codecs/GetWebSocketsTokenRequest'
import { GetWebSocketsTokenResponse } from './rest-codecs/GetWebSocketsTokenResponse'
import { KrakenError } from './rest-codecs/KrakenError'
import { OpenOrdersRequest } from './rest-codecs/OpenOrdersRequest'
import { OpenOrdersResponse } from './rest-codecs/OpenOrdersResponse'
import { OpenPositionsRequest } from './rest-codecs/OpenPositionsRequest'
import { OpenPositionsResponse } from './rest-codecs/OpenPositionsResponse'
import { TimeRequest } from './rest-codecs/TimeRequest'
import { TimeResponse } from './rest-codecs/TimeResponse'
import { CancelAllRequest } from './rest-codecs/CancelAllRequest'
import { CancelAllResponse } from './rest-codecs/CancelAllResponse'

type KrakenClientConfig = {
    key: string
    secret: string
    version: number
    url: string
    requestTimeoutMS: number
}

export type KrakenApiError =
    | { type: 'unable to parse http response'; response: unknown; error: Error }
    | { type: 'unable to decode codec'; codec: string; error: string }
    | { type: 'http request error'; error: Error }
    | { type: 'unexpected http response'; error: string }
    | { type: 'kraken server error'; error: string[] }

const err: Endomorphism<KrakenApiError> = identity

const defaultKrakenClientConfig: Omit<KrakenClientConfig, 'key' | 'secret'> = {
    version: 0,
    url: 'https://api.kraken.com',
    requestTimeoutMS: 5000,
}

type KrakenApiEndpoint<A extends t.Mixed, B extends t.Mixed> = {
    request: A
    response: B
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KrakenApiRequest<T> = T extends KrakenApiEndpoint<infer A, any>
    ? t.TypeOf<A>
    : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KrakenApiResponse<T> = T extends KrakenApiEndpoint<any, infer A>
    ? t.TypeOf<A>
    : never

const PublicApi = {
    Time: {
        request: TimeRequest,
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

// DISCUSS: why a codec for the request type? we're not decoding that,
// instead leveraging the type system.  I suppose it does allow us to
// work with JS though, one day. Should output a TE either way

// TODO: FIXME: request parameters should reflect partial nature. Is
// every-single param optional?

// TODO: check for new endpoints that aren't in this list yet
const PrivateApi = {
    Balance: {
        request: BalanceRequest,
        response: BalanceResponse,
    },
    // 'TradeBalance',
    OpenOrders: {
        request: OpenOrdersRequest,
        response: OpenOrdersResponse,
    },
    // 'ClosedOrders',
    // 'QueryOrders',
    // 'TradesHistory',
    // 'QueryTrades',
    OpenPositions: {
        request: OpenPositionsRequest,
        response: OpenPositionsResponse,
    },
    // 'Ledgers',
    // 'QueryLedgers',
    // 'TradeVolume',
    AddOrder: {
        request: AddOrderRequest,
        response: AddOrderResponse,
    },
    // TODO: Implement
    // 'CancelOrder',
    CancelAll: {
        request: CancelAllRequest,
        response: CancelAllResponse,
    },
    // TODO: Implement this dead-man's switch
    // 'CancelAllOrdersAfter'
    // 'DepositMethods',
    // 'DepositAddresses',
    // 'DepositStatus',
    // 'WithdrawInfo',
    // 'Withdraw',
    // 'WithdrawStatus',
    // 'WithdrawCancel',
    // RESUME: implement
    GetWebSocketsToken: {
        request: GetWebSocketsTokenRequest,
        response: GetWebSocketsTokenResponse,
    },
} as const
type PrivateApi = typeof PrivateApi

type KrakenClient = {
    [A in keyof PublicApi]: (
        request?: KrakenApiRequest<PublicApi[A]>,
    ) => TE.TaskEither<KrakenApiError, KrakenApiResponse<PublicApi[A]>>
} &
    {
        [A in keyof PrivateApi]: (
            request?: KrakenApiRequest<PrivateApi[A]>,
        ) => TE.TaskEither<KrakenApiError, KrakenApiResponse<PrivateApi[A]>>
    }

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

const parseJson = (json: string) =>
    pipe(
        E.parseJSON(json, E.toError),
        E.mapLeft((error) =>
            err({
                type: 'unable to parse http response',
                response: json,
                error,
            }),
        ),
    )

const decode = <A extends t.Mixed>(codec: A) => (
    a: unknown,
): E.Either<KrakenApiError, t.TypeOf<A>> =>
    pipe(
        codec.decode(a),
        E.mapLeft(
            flow(
                (errors) => PathReporter.failure(errors).join('\n'),
                (error) =>
                    err({
                        type: 'unable to decode codec',
                        codec: codec.name,
                        error,
                    }),
            ),
        ),
    )

const decodeResponse = <A extends t.Mixed>(responseCodec: A) => (
    response: string,
): TE.TaskEither<KrakenApiError, t.TypeOf<A>> =>
    pipe(
        parseJson(response),
        E.chain((parsedResponse) =>
            pipe(
                decode(t.type({ error: KrakenError }))(parsedResponse),
                E.map((response) =>
                    err({ type: 'kraken server error', error: response.error }),
                ),
                E.swap,
                E.chain(() =>
                    pipe(
                        decode(t.type({ result: responseCodec }))(
                            parsedResponse,
                        ),
                        E.map(({ result }) => result),
                    ),
                ),
            ),
        ),
        TE.fromEither,
    )

// Send an API request
const rawRequest = (
    url: string,
    headers: Record<string, string>,
    // TODO: type better
    data: Record<string, unknown>,
    timeout: number,
): TE.TaskEither<KrakenApiError, string> =>
    pipe(
        TE.tryCatch(
            async () =>
                got(url, {
                    method: 'POST',
                    body: stringify(data),
                    headers: Object.assign(
                        { 'User-Agent': 'Kraken Javascript API Client' },
                        headers,
                    ),
                    timeout,
                }).then(({ body }) => body),
            flow(E.toError, (error) =>
                err({ type: 'http request error', error }),
            ),
        ),
        TE.chain(flow(decode(t.string), TE.fromEither)),
    )

// FEATURE: make the key|secret optional and only return the public endpoints
export const krakenClient = (
    clientConfig: Partial<KrakenClientConfig> &
        Pick<KrakenClientConfig, 'key' | 'secret'>,
): KrakenClient => {
    const config = Object.assign({}, defaultKrakenClientConfig, clientConfig)

    // FIXME: type inferencing here is defaulting to sum types
    const publicApi = pipe(
        PublicApi,
        R.mapWithIndex(
            (apiMethod, { request: requestCodec, response: responseCodec }) => (
                request: t.TypeOf<typeof requestCodec>,
            ): TE.TaskEither<KrakenApiError, t.TypeOf<typeof responseCodec>> =>
                pipe(
                    rawRequest(
                        `${config.url}/${config.version}/public/${apiMethod}`,
                        {},
                        request ?? {},
                        config.requestTimeoutMS,
                    ),
                    TE.chain(decodeResponse(responseCodec)),
                ),
        ),
    )

    // FIXME: type inferencing here is defaulting to sum types
    const privateApi = pipe(
        PrivateApi,
        R.mapWithIndex(
            (apiMethod, { request: requestCodec, response: responseCodec }) => (
                request: t.TypeOf<typeof requestCodec>,
            ): TE.TaskEither<
                KrakenApiError,
                t.TypeOf<typeof responseCodec>
            > => {
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

                return pipe(
                    rawRequest(url, headers, request_, config.requestTimeoutMS),
                    TE.chain(decodeResponse(responseCodec)),
                )
            },
        ),
    )

    // TODO: avoid type assertion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.assign({}, publicApi as any, privateApi as any)
}
