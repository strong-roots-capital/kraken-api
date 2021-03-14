import * as t from 'io-ts'
import { DateFromKrakenUnixTime } from '../DateFromKrakenUnixTime'
import { NumberFromString } from 'io-ts-types'
import { OrderType } from '../OrderType'
import { KrakenOrderID } from '../KrakenOrderID'
import { StringOfNumber } from '../StringOfNumber'
import { ClassifiedCurrency } from '../ClassifiedCurrency'

export const OpenPosition = t.intersection([
    t.type({
        ordertxid: KrakenOrderID,
        // was 'open'
        posstatus: t.string,
        pair: ClassifiedCurrency,
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
])

export type OpenPosition = t.TypeOf<typeof OpenPosition>

// Domain is actually KrakenOrderID
export const OpenPositionsResponse = t.record(t.string, OpenPosition)

export type OpenPositionsResponse = t.TypeOf<typeof OpenPositionsResponse>
