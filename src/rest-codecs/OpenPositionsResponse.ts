import * as t from 'io-ts'
import { DateFromKrakenUnixTime } from '../DateFromKrakenUnixTime'
import { NumberFromString } from 'io-ts-types'
import { OrderType } from '../OrderType'
import { KrakenOrderID } from '../KrakenOrderID'
import { StringOfNumber } from '../StringOfNumber'

export const OpenPositionsResponse = t.record(
    KrakenOrderID,
    t.intersection([
        t.type({
            ordertxid: KrakenOrderID,
            // was 'open'
            posstatus: t.string,
            // Something like XXBTZUSD
            pair: t.string,
            time: DateFromKrakenUnixTime,
            type: t.keyof({
                buy: null,
                sell: null,
            }),
            ordertype: OrderType,
            cost: StringOfNumber,
            fee: StringOfNumber,
            vol: StringOfNumber,
            vol_closed: StringOfNumber,
            margin: StringOfNumber,
            terms: t.string,
            rollovertm: NumberFromString.pipe(DateFromKrakenUnixTime),
            misc: t.string,
            oflags: t.string,
        }),
        t.partial({
            value: StringOfNumber,
            net: StringOfNumber,
        }),
    ]),
)
