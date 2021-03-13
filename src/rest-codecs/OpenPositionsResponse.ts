import * as t from 'io-ts'
import { DateFromKrakenUnixTime } from '../DateFromKrakenUnixTime'
import { NumberFromString } from 'io-ts-types'

// RESUME (top of the stack): write this codec
export const OpenPositionsResponse = t.record(
    t.string,
    t.intersection([
        t.type({
            // FIXME: a KrakenTxId
            ordertxid: t.string,
            // was 'open'
            posstatus: t.string,
            pair: t.string,
            time: DateFromKrakenUnixTime,
            type: t.keyof({
                buy: null,
                sell: null,
            }),
            ordertype: t.keyof({
                // FIXME: must be more types here (same as OpenOrdersResponse)
                limit: null,
            }),
            // FIXME: is really StringOfNumber
            cost: t.string,
            // FIXME: is really StringOfNumber
            fee: t.string,
            // FIXME: is really StringOfNumber
            vol: t.string,
            // FIXME: is really StringOfNumber
            vol_closed: t.string,
            // FIXME: is really StringOfNumber
            margin: t.string,
            terms: t.string,
            rollovertm: NumberFromString.pipe(DateFromKrakenUnixTime),
            misc: t.string,
            oflags: t.string,
        }),
        t.partial({
            // FIXME: is really StringOfNumber
            value: t.string,
            // FIXME: is really StringOfNumber
            net: t.string,
        }),
    ]),
)