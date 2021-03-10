import * as t from 'io-ts'
import { DateFromKrakenUnixTime } from './DateFromKrakenUnixTime'

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
                // FIXME: couldn't see this nested output
                descr: t.type({}),
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
