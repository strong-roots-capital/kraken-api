import * as t from 'io-ts'
import { OrderType } from '../OrderType'
import { DateFromKrakenUnixTime } from '../DateFromKrakenUnixTime'
import { KrakenOrderID } from '../KrakenOrderID'
import { StringOfNumber } from '../StringOfNumber'

export const OpenOrdersResponse = t.record(
    // FIXME: narrow this type, seen: 'open',
    t.string,
    t.record(
        KrakenOrderID,
        t.intersection([
            t.type({
                // FIXME: not sure what this is
                // refid: null,
                userref: t.Int,
                status: t.keyof({
                    pending: null,
                    open: null,
                    closed: null,
                    canceled: null,
                    expired: null,
                }),
                opentm: DateFromKrakenUnixTime,
                // FIXME: implement this -- 0 seems to mean 'not defined', otherwise a DateFromKrakenUnixTime?
                // starttm: 0,
                // FIXME: implement this -- 0 seems to mean 'not defined', otherwise a DateFromKrakenUnixTime?
                // expiretm: 0,
                descr: t.type({
                    // TODO: brand to Tradepair
                    pair: t.string,
                    type: t.keyof({
                        buy: null,
                        sell: null,
                    }),
                    ordertype: OrderType,
                    price: StringOfNumber,
                    price2: StringOfNumber,
                    // FIXME: improve the below
                    // Something like '3:1' or 'none'
                    leverage: t.string,
                    // human-readable description
                    order: t.string,
                    // FIXME: not sure what this is, haven't seen it yet
                    close: t.string,
                }),
                vol: StringOfNumber,
                vol_exec: StringOfNumber,
                cost: StringOfNumber,
                fee: StringOfNumber,
                price: StringOfNumber,
                stopprice: StringOfNumber,
                limitprice: StringOfNumber,
                misc: t.string,
                oflags: t.keyof({
                    // volume in quote currency
                    viqc: null,
                    // prefer fee in base currency (default if selling)
                    fcib: null,
                    // prefer fee in quote currency (default if buying)
                    fciq: null,
                    // no market price protection
                    nompp: null,
                }),
            }),
            t.partial({
                // FIXME: haven't seen this yet but I suspect it's another Kraken order id
                trades: t.array(t.string),
            }),
        ]),
    ),
)
