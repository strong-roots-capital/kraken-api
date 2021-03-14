import * as t from 'io-ts'
import Debug from 'debug'
import WebSocket from 'ws'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as R from 'fp-ts/Record'
import * as TE from 'fp-ts/TaskEither'
import { webSocket } from 'rxjs/webSocket'
import { constVoid, flow, pipe } from 'fp-ts/function'
import { match, when } from 'ts-pattern'
import { krakenClient } from './rest'
import { BehaviorSubject } from 'rxjs'
import { trace } from '@strong-roots-capital/trace'
import { Heartbeat } from './ws-codecs/Heartbeat'
import { SystemStatusMessage } from './ws-codecs/SystemStatusMessage'
import { AuthenticatedChannelMessage } from './ws-codecs/AuthenticatedChannelMessage'
import { AuthenticatedSubscriptionMessage } from './ws-codecs/AuthenticatedSubscriptionMessage'
import { OwnTradesMessage } from './ws-codecs/OwnTradesMessage'
import { OpenOrdersMessage } from './ws-codecs/OpenOrdersMessage'
import { AuthenticatedSubscriptionResponse } from './ws-codecs/AuthenticatedSubscriptionResponse'
import { AuthenticatedSubscriptionChannel } from './ws-codecs/AuthenticatedSubscriptionChannel'

const debug = {
    ws: Debug('kraken:websocket'),
    openOrders: Debug('kraken:orders'),
    ownTrades: Debug('kraken:trades'),
} as const

export type KrakenPrivateWebsocket = {
    subscribe(request: {channel: 'ownTrades'}): Promise<BehaviorSubject<OwnTradesMessage[]>>;
    subscribe(request: {channel: 'openOrders'}): Promise<BehaviorSubject<OpenOrdersMessage[]>>;
}

export const krakenPrivateWebsocket =
    (restAuthentication: {key: string, secret: string}): KrakenPrivateWebsocket => {

        const subscribers: Record<string, BehaviorSubject<AuthenticatedChannelMessage[]>> = {}
        let pending: Record<string, (value: BehaviorSubject<AuthenticatedChannelMessage[]>) => void> = {}

        const subject = webSocket<unknown[]>({
            url: 'wss://ws-auth.kraken.com',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            WebSocketCtor: WebSocket as any,
        })

        const tokenPromise = pipe(
            krakenClient(restAuthentication),
            client => client.GetWebSocketsToken(),
            TE.map(({ token }) => token),
            TE.getOrElseW(error => { throw E.toError(JSON.stringify(error)) }),
            invokeTask => invokeTask()
        )

        async function subscribe(request: { channel: 'ownTrades' }): Promise<BehaviorSubject<OwnTradesMessage[]>>;
        async function subscribe(request: { channel: 'openOrders' }): Promise<BehaviorSubject<OpenOrdersMessage[]>>;
        async function subscribe(request: { channel: AuthenticatedSubscriptionChannel }) {

            const token = await tokenPromise

            return new Promise((resolve) => {

                pending[request.channel] = resolve

                subject.next({
                    event: 'subscribe',
                    subscription: {
                        name: request.channel,
                        token,
                    }
                    // Need to bypass the type system here because the subject
                    // has no way to type input and output separately
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any)

            })
        }

        // handle messages at the library level to implement inverse-multiplexing
        subject.subscribe(
            message => match<unknown>(message)
                .with(when(AuthenticatedSubscriptionMessage(AuthenticatedChannelMessage).is), a => {

                    pipe(
                        AuthenticatedChannelMessage.decode(a),
                        E.map(
                            decoded => pipe(
                                match<t.TypeOf<typeof AuthenticatedChannelMessage>, AuthenticatedChannelMessage>(decoded)
                                    .with(when(OwnTradesMessage.is), flow(
                                        OwnTradesMessage.encode.bind(null),
                                        trace(debug.ownTrades),
                                    ))
                                    .with(when(OpenOrdersMessage.is), flow(
                                        OpenOrdersMessage.encode.bind(null),
                                        trace(debug.openOrders),
                                    ))
                                    .exhaustive(),
                                encoded => pipe(
                                    R.lookup(encoded.message)(subscribers),
                                    O.fold(
                                        () => console.warn('received message for unknown subscriber:', a),
                                        subscriber => subscriber.next([encoded])
                                    ),
                                )
                            )
                        ),
                        E.getOrElse(() => console.warn('AuthenticatedChannelMessage type-guard permitted message that did not decode:', message))
                    )
                })
                .with(when(AuthenticatedSubscriptionResponse.is), a => {
                    debug.ws('subscription handshake complete')
                    pipe(
                        R.pop(a.channelName)(pending),
                        O.map(([resolve, pending_]) => {
                            pending = pending_
                            const stream = new BehaviorSubject<AuthenticatedChannelMessage[]>([])
                            subscribers[a.channelName] = stream
                            resolve(stream)
                        })
                    )
                })
                .with(when(Heartbeat.is), constVoid)
                .with(when(SystemStatusMessage.is), debug.ws)
                .otherwise(() => console.warn('unmatched message:', JSON.stringify(message, null, 2))),
            console.error,
            constVoid,
        )

        return { subscribe }
    }
