import * as t from 'io-ts'
import * as A from 'fp-ts/ReadonlyNonEmptyArray'
import * as R from 'fp-ts/ReadonlyRecord'
import { pipe } from 'fp-ts/function'
import { nonEmptyArray, withEncode } from 'io-ts-types'
import { OrderType } from '../OrderType'

const Order = t.partial({
    // FIXME: really StringOfNumber
    cost: t.string,
    descr: t.type({
        // FIXME: really StringOfNumber or empty string
        // close: "",
        // FIXME: improve the below
        // Something like '3:1' or null
        leverage: t.union([t.null, t.string]),
        order: t.string,
        ordertype: OrderType,
        // FIXME: really a tradepair with a /
        pair: t.string,
        // FIXME: really StringOfNumber
        price: t.string,
        // FIXME: really StringOfNumber
        price2: t.string,
        type: t.keyof({
            buy: null,
            sell: null,
        }),
    }),
    // FIXME: really string of a date in kraken time or it's zero, so /shrug
    expiretm: t.union([t.null, t.string]),
    // FIXME: really StringOfNumber
    fee: t.string,
    // FIXME: really StringOfNumber
    limitprice: t.string,
    // misc: "",
    // oflags: "fcib",
    // FIXME: really string of a date in kraken time or it's zero, so /shrug
    // opentm: "0.000000",

    // FIXME: really StringOfNumber
    // NOTE: this doesn't seem to exist???
    // price: t.string,

    // FIXME: really a Kraken Order ID or null
    refid: t.union([t.null, t.string]),
    starttm: t.union([t.null, t.string]),
    status: t.keyof({
        open: null,
        pending: null,
        canceled: null,
        closed: null,
    }),
    // FIXME: really StringOfNumber
    stopprice: t.string,
    // userref: 0,
    // FIXME: really StringOfNumber
    vol: t.string,
    // FIXME: really StringOfNumber
    vol_exec: t.string,
})

// Here we force `orderid` to exist, which is how the
// websocket delivers OpenOrderMessages, even though this
// is not true from the point-of-view of the Order codec.
// As protection against this contradiction, we do not export
// the Order codec for external use.
// FIXME: orderid can be narrowed to Kraken Order ID
export type Order = t.TypeOf<typeof Order> & { orderid: string }

// NOTE: this is only for the initial snapshot
export const OpenOrdersMessage = withEncode(
    t.tuple([
        nonEmptyArray(
            // FIXME: domain is really a Kraken Order ID
            t.record(t.string, Order),
        ),
        t.literal('openOrders'),
        t.type({
            sequence: t.number,
        }),
    ]),
    // NOTE: this doesn't encode each order with the Order codec
    (a) => ({
        message: a[1],
        orders: pipe(
            a[0],
            A.chain(
                (record) =>
                    R.collect(
                        (orderid, v) => Object.assign(v, { orderid }),
                        // FIXME: orderid can be narrowed to Kraken Order ID
                    )(record) as A.ReadonlyNonEmptyArray<
                        Order & { orderid: string }
                    >,
            ),
        ),
    }),
)

export type OpenOrdersMessage = t.OutputOf<typeof OpenOrdersMessage>

// NOTE: encoded snapshot example
// {
//   "avg_price": "0.00000",
//   "cost": "0.00000",
//   "descr": {
//     "close": null,
//     "leverage": "3:1",
//     "order": "buy 750.00000000 DOT/USD @ limit 19.00000 with 3:1 leverage",
//     "ordertype": "limit",
//     "pair": "DOT/USD",
//     "price": "19.00000",
//     "price2": "0.00000",
//     "type": "buy"
//   },
//   "expiretm": null,
//   "fee": "0.00000",
//   "limitprice": "0.00000",
//   "misc": "",
//   "oflags": "fciq",
//   "opentm": "1614302258.088804",
//   "refid": null,
//   "starttm": null,
//   "status": "open",
//   "stopprice": "0.00000",
//   "timeinforce": "GTC",
//   "userref": 0,
//   "vol": "750.00000000",
//   "vol_exec": "0.00000000",
//   "orderid": "ODE6LB-XSYFJ-CDHXNJ"
// }

// NOTE: encoded open example
// [
//   {
//     "message": "openOrders",
//     "orders": [
//       {
//         "status": "open",
//         "orderid": "O2OXMT-UMSXS-IEH6RP"
//       }
//     ]
//   }
// ]

// NOTE: canceled example
// const a = [
//   [
//     {
//       "OIFAB2-A4N32-6ME37U": {
//         "status": "canceled",
//         "cost": "0.00000",
//         "vol_exec": "0.00000000",
//         "fee": "0.00000",
//         "avg_price": "0.00000",
//         "lastupdated": "1615655385.053620",
//         "cancel_reason": "User requested"
//       }
//     }
//   ],
//   "openOrders",
//   {
//     "sequence": 4
//   }
// ]

// NOTE: encoded canceled example
// [
//   {
//     "message": "openOrders",
//     "orders": [
//       {
//         "status": "canceled",
//         "cost": "0.00000",
//         "vol_exec": "0.00000000",
//         "fee": "0.00000",
//         "avg_price": "0.00000",
//         "lastupdated": "1615655529.044592",
//         "cancel_reason": "User requested",
//         "orderid": "O2OXMT-UMSXS-IEH6RP"
//       }
//     ]
//   }
// ]

// NOTE: pending example
// const a = [
//   [
//     {
//       "OVADIM-ZD6UB-ESVR7Y": {
//         "avg_price": "0.00000",
//         "cost": "0.00000",
//         "descr": {
//           "close": null,
//           "leverage": "3:1",
//           "order": "buy 1.00000000 DOT/USD @ limit 33.00000 with 3:1 leverage",
//           "ordertype": "limit",
//           "pair": "DOT/USD",
//           "price": "33.00000",
//           "price2": "0.00000",
//           "type": "buy"
//         },
//         "expiretm": null,
//         "fee": "0.00000",
//         "limitprice": "0.00000",
//         "misc": "",
//         "oflags": "fciq",
//         "opentm": "1615654653.192620",
//         "refid": null,
//         "starttm": null,
//         "status": "pending",
//         "stopprice": "0.00000",
//         "timeinforce": "GTC",
//         "userref": 0,
//         "vol": "1.00000000",
//         "vol_exec": "0.00000000"
//       }
//     }
//   ],
//   "openOrders",
//   {
//     "sequence": 2
//   }
// ]

// NOTE: encoded pending example
// [
//   {
//     "message": "openOrders",
//     "orders": [
//       {
//         "avg_price": "0.00000",
//         "cost": "0.00000",
//         "descr": {
//           "close": null,
//           "leverage": "3:1",
//           "order": "buy 1.00000000 DOT/USD @ limit 33.00000 with 3:1 leverage",
//           "ordertype": "limit",
//           "pair": "DOT/USD",
//           "price": "33.00000",
//           "price2": "0.00000",
//           "type": "buy"
//         },
//         "expiretm": null,
//         "fee": "0.00000",
//         "limitprice": "0.00000",
//         "misc": "",
//         "oflags": "fciq",
//         "opentm": "1615655457.124586",
//         "refid": null,
//         "starttm": null,
//         "status": "pending",
//         "stopprice": "0.00000",
//         "timeinforce": "GTC",
//         "userref": 0,
//         "vol": "1.00000000",
//         "vol_exec": "0.00000000",
//         "orderid": "O2OXMT-UMSXS-IEH6RP"
//       }
//     ]
//   }
// ]

// NOTE: encoded partial-fill message
// const a = [
//   {
//     "message": "openOrders",
//     "orders": [
//       {
//         "cost": "24.56998",
//         "vol_exec": "0.01299999",
//         "fee": "0.02457",
//         "avg_price": "1889.99992",
//         "orderid": "O2YHEX-DTBCM-6TWHWU"
//       }
//     ]
//   }
// ]

// NOTE: message order canceled due to insignificant volume remaining
// const a = [
//   [
//     {
//       "O2YHEX-DTBCM-6TWHWU": {
//         "status": "closed",
//         "cost": "24.56998",
//         "vol_exec": "0.01299999",
//         "fee": "0.02457",
//         "avg_price": "1889.99992",
//         "lastupdated": "1615655720.609885",
//         "cancel_reason": "Insignificant volume remaining"
//       }
//     }
//   ],
//   "openOrders",
//   {
//     "sequence": 8
//   }
// ]

// NOTE: market order closed due to filled
// const a = [
//   [
//     {
//       "OHJN44-KJITE-HAPBGK": {
//         "status": "closed",
//         "cost": "24.55308",
//         "vol_exec": "0.01299999",
//         "fee": "0.04420",
//         "avg_price": "1888.69991",
//         "lastupdated": "1615655752.935134"
//       }
//     }
//   ],
//   "openOrders",
//   {
//     "sequence": 12
//   }
// ]

// import { PathReporter } from 'io-ts/lib/PathReporter'
// pipe(
//     OpenOrdersMessage.decode(a),
//     PathReporter.report,
//     console.log,
// )
