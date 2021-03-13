import * as t from 'io-ts'
import * as A from 'fp-ts/ReadonlyArray'
import { pipe } from 'fp-ts/function'
import { nonEmptyArray, NumberFromString, withEncode } from 'io-ts-types'
import { DateFromKrakenUnixTime } from '../DateFromKrakenUnixTime'
import { OrderType } from '../OrderType'

// TODO: test me

export const OwnTrade = t.type({
    // FIXME: really StringOfNumber
    cost: t.string,
    fee: t.string,
    margin: t.string,
    // FIXME: really Kraken Order ID
    ordertxid: t.string,
    ordertype: OrderType,
    // FIXME: really Tradepair (with a /)
    pair: t.string,
    // FIXME: really Kraken Order ID
    postxid: t.string,
    // FIXME: really StringOfNumber
    price: t.string,
    time: NumberFromString.pipe(DateFromKrakenUnixTime),
    type: t.keyof({
        buy: null,
        sell: null,
    }),
    // FIXME: really StringOfNumber
    vol: t.string,
})
type OwnTrade = t.TypeOf<typeof OwnTrade>

export const OwnTradesMessage = withEncode(
    t.tuple([
        nonEmptyArray(
            // FIXME: domain is really a Kraken Order ID
            t.record(t.string, OwnTrade),
        ),
        t.literal('ownTrades'),
        t.type({
            sequence: t.number,
        }),
    ]),
    // TODO: make this a NonEmptyArray like OpenOrders
    (a) => ({
        message: a[1],
        trades: pipe(
            a[0],
            A.reduce(
                // FIXME: domain is really a Kraken Order ID
                {} as Record<string, OwnTrade>,
                (acc, trade) => Object.assign(acc, trade),
            ),
        ),
    }),
)

export type OwnTradesMessage = t.OutputOf<typeof OwnTradesMessage>
