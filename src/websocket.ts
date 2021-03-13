import WebSocket from 'ws'
import Debug from 'debug'
import * as t from 'io-ts'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as R from 'fp-ts/Record'
import { pipe, constVoid } from 'fp-ts/function'
import { match, when } from 'ts-pattern'
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'
import { BehaviorSubject } from 'rxjs'
import { SubscriptionMessage } from './ws-codecs/SubscriptionMessage'
import { SubscriptionResponse } from './ws-codecs/SubscriptionResponse'
import { Heartbeat } from './ws-codecs/Heartbeat'
import { SystemStatusMessage } from './ws-codecs/SystemStatusMessage'
import { SubscriptionChannel } from './ws-codecs/SubscriptionChannel'
import { ChannelMessage } from './ws-codecs/ChannelMessage'
import { SpreadMessage } from './ws-codecs/SpreadMessage'
import { OhlcMessage } from './ws-codecs/OhlcMessage'

const debug = {
    ws: Debug('kraken:websocket')
}

const url = 'wss://ws.kraken.com' as const

// type KrakenWsApiEndpoint<A extends t.Mixed, B extends t.Mixed> = {
//     request: A
//     response: B
// }

export type KrakenPublicWebsocket = {
    __tag: 'KrakenPublicWebSocket',
    subject: WebSocketSubject<ChannelMessage[]>
    subscribe(request: {channel: 'spread', pairs: string[]}): Promise<BehaviorSubject<SpreadMessage[]>>;
    subscribe(request: {channel: 'ohlc', pairs: string[]}): Promise<BehaviorSubject<OhlcMessage[]>>;
}

export const krakenPublicWebsocket = (): KrakenPublicWebsocket => {

    let reqID = 0
    const subscribers: Record<string, BehaviorSubject<ChannelMessage[]>> = {}
    let pending: Record<string, (value: BehaviorSubject<ChannelMessage[]>) => void> = {}

    const subject = webSocket({
        url,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        WebSocketCtor: WebSocket as any,
    })

    function subscribe(request: {channel: SubscriptionChannel, pairs: string[]}) {
        const reqid = reqID++

        return new Promise((resolve) => {

            pending[reqid] = resolve

            subject.next({
                event: 'subscribe',
                pair: request.pairs,
                subscription: {
                    name: request.channel,
                },
                reqid,
            })
        })
    }

    subject.subscribe(
        message => match(message)
            .with(when(SubscriptionMessage(ChannelMessage).is), a => {
                const id = a[0]
                a.shift()

                pipe(
                    a,
                    ChannelMessage.decode.bind(null),
                    E.map(
                        decoded => pipe(
                            match<t.TypeOf<typeof ChannelMessage>, ChannelMessage>(decoded)
                                .with(when(SpreadMessage.is), SpreadMessage.encode.bind(null))
                                .with(when(OhlcMessage.is), OhlcMessage.encode.bind(null))
                                .exhaustive(),
                            encoded => pipe(
                                R.lookup(id.toString())(subscribers),
                                O.map(subscriber => subscriber.next([encoded])),
                                O.getOrElse(() => console.warn('received message for unknown subscriber:', id, a))
                            )
                        )
                    ),
                    E.getOrElse(() => console.warn('ChannelMessage type-guard permitted message that did not decode:', { channelID: id, message: a }))
                )
            })
            .with(when(SubscriptionResponse.is), a => {
                debug.ws('subscription handshake complete')
                pipe(
                    R.pop(a.reqid.toString())(pending),
                    O.map(([resolve, pending_]) => {
                        pending = pending_
                        const stream = new BehaviorSubject<ChannelMessage[]>([])
                        subscribers[a.channelID] = stream
                        resolve(stream)
                    })
                )
            })
            .with(when(Heartbeat.is), constVoid)
            .with(when(SystemStatusMessage.is), debug.ws)
            .otherwise(() => console.warn('unmatched message:', message)),
        console.error,
        constVoid,
    )

    return Object.assign(
        {
            subject,
            subscribe
        }
    )
}

// TODO: create the private websocket
