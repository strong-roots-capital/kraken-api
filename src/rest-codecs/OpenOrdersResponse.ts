import * as t from 'io-ts'
import { DateFromKrakenUnixTime } from '../DateFromKrakenUnixTime'

export const OpenOrdersResponse = t.record(
    // FIXME: narrow this type, seen: 'open',
    t.string,
    t.record(
        // FIXME: Kraken order id
        t.string,
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
                    ordertype: t.keyof({
                        // FIXME: must be more types here (same as OpenPositionsResponse)
                        limit: null,
                    }),
                    // FIXME: is really StringOfNumber
                    price: t.string,
                    // FIXME: is really StringOfNumber (Note: is 0 when unspecified)
                    price2: t.string,
                    // FIXME: improve the below
                    // Something like '3:1' or 'none'
                    leverage: t.string,
                    // human-readable description
                    order: t.string,
                    // FIXME: not sure what this is, haven't seen it yet
                    close: t.string,
                }),
                // FIXME: is really StringOfNumber
                vol: t.string,
                // FIXME: is really StringOfNumber
                vol_exec: t.string,
                // FIXME: is really StringOfNumber
                cost: t.string,
                // FIXME: is really StringOfNumber
                fee: t.string,
                // FIXME: is really StringOfNumber
                price: t.string,
                // FIXME: is really StringOfNumber
                stopprice: t.string,
                // FIXME: is really StringOfNumber
                limitprice: t.string,
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
