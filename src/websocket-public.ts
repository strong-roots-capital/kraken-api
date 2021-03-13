import Debug from 'debug'
import WebSocket from 'ws'
import * as t from 'io-ts'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as R from 'fp-ts/Record'
import { pipe, constVoid } from 'fp-ts/function'
import { match, when } from 'ts-pattern'
import { webSocket } from 'rxjs/webSocket'
import { BehaviorSubject } from 'rxjs'
import { SubscriptionMessage } from './ws-codecs/SubscriptionMessage'
import { SubscriptionResponse } from './ws-codecs/SubscriptionResponse'
import { Heartbeat } from './ws-codecs/Heartbeat'
import { SystemStatusMessage } from './ws-codecs/SystemStatusMessage'
import { SubscriptionChannel } from './ws-codecs/SubscriptionChannel'
import { ChannelMessage } from './ws-codecs/ChannelMessage'
import { SpreadMessage } from './ws-codecs/SpreadMessage'
import { OhlcMessage } from './ws-codecs/OhlcMessage'
import { safeReqID } from './reqid'

const debug = {
    ws: Debug('kraken:websocket')
}

export type KrakenPublicWebsocket = {
    subscribe(request: {channel: 'spread', pairs: string[]}): Promise<BehaviorSubject<SpreadMessage[]>>;
    subscribe(request: {channel: 'ohlc', pairs: string[]}): Promise<BehaviorSubject<OhlcMessage[]>>;
}

export const krakenPublicWebsocket = (): KrakenPublicWebsocket => {

    const subscribers: Record<string, BehaviorSubject<ChannelMessage[]>> = {}
    let pending: Record<string, (value: BehaviorSubject<ChannelMessage[]>) => void> = {}

    const subject = webSocket<ChannelMessage[]>({
        url: 'wss://ws.kraken.com',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        WebSocketCtor: WebSocket as any,
    })

    async function subscribe(request: {channel: 'spread', pairs: string[]}): Promise<BehaviorSubject<SpreadMessage[]>>;
    async function subscribe(request: {channel: 'ohlc', pairs: string[]}): Promise<BehaviorSubject<OhlcMessage[]>>;
    async function subscribe(request: {channel: SubscriptionChannel, pairs: string[]}) {

        const reqid = safeReqID()

        return new Promise((resolve) => {

            pending[reqid] = resolve

            // send the subscribe request to kraken
            subject.next({
                event: 'subscribe',
                pair: request.pairs,
                subscription: {
                    name: request.channel,
                },
                reqid,
                // Need to bypass the type system here because the subject
                // has no way to type input and output separately
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any)
        })
    }

    // handle messages at the library level to implement inverse-multiplexing
    subject.subscribe(
        message => match<unknown>(message)
            .with(when(SubscriptionMessage(ChannelMessage).is), a => {
                const id = a[0]
                a.shift()

                pipe(
                    ChannelMessage.decode(a),
                    E.map(
                        decoded => pipe(
                            match<t.TypeOf<typeof ChannelMessage>, ChannelMessage>(decoded)
                                .with(when(SpreadMessage.is), SpreadMessage.encode.bind(null))
                                .with(when(OhlcMessage.is), OhlcMessage.encode.bind(null))
                                .exhaustive(),
                            encoded => pipe(
                                R.lookup(id.toString())(subscribers),
                                O.fold(
                                    () => console.warn('received message for unknown subscriber:', id, a),
                                    subscriber => subscriber.next([encoded])
                                ),
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
            .otherwise(() => console.warn('unmatched message:', JSON.stringify(message, null, 2))),
        console.error,
        constVoid,
    )

    return {subscribe}
}
