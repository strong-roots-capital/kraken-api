import * as t from 'io-ts'
import * as A from 'fp-ts/ReadonlyNonEmptyArray'
import { pipe } from 'fp-ts/function'
import { nonEmptyArray, NumberFromString, withEncode } from 'io-ts-types'
import { DateFromKrakenUnixTime } from '../DateFromKrakenUnixTime'
import { OrderType } from '../OrderType'
import { KrakenOrderID } from '../KrakenOrderID'
import { StringOfNumber } from '../StringOfNumber'
import { WebsocketTradepair } from '../WebsocketTradepair'

export const OwnTrade = t.type({
    cost: StringOfNumber,
    fee: StringOfNumber,
    margin: StringOfNumber,
    ordertxid: KrakenOrderID,
    ordertype: OrderType,
    pair: WebsocketTradepair,
    postxid: KrakenOrderID,
    price: StringOfNumber,
    time: NumberFromString.pipe(DateFromKrakenUnixTime),
    type: t.keyof({
        buy: null,
        sell: null,
    }),
    vol: StringOfNumber,
})

export type OwnTrade = t.TypeOf<typeof OwnTrade>

export const OwnTradesMessage = withEncode(
    t.tuple([
        nonEmptyArray(t.record(t.string, OwnTrade)),
        t.literal('ownTrades'),
        t.type({
            sequence: t.number,
        }),
    ]),
    (a) => ({
        message: a[1],
        trades: pipe(
            a[0],
            // Note: domain is actually a KrakenOrderID,
            A.reduce({} as Record<string, OwnTrade>, (acc, trade) =>
                Object.assign(acc, trade),
            ),
        ),
    }),
)

export type OwnTradesMessage = t.OutputOf<typeof OwnTradesMessage>
