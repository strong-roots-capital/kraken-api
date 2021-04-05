import * as t from 'io-ts'
import { withEncode } from 'io-ts-types'
import { OrderType } from '../OrderType'

const post = t.literal('post')
const nompp = t.literal('nompp')
const fcib = t.literal('fcib')
const fciq = t.literal('fciq')

// FEATURE: use more human-readable tokens (aka avoid implementation bleed)
const OrderFlags = withEncode(
    t.union([
        t.tuple([post]),
        t.tuple([nompp]),
        t.tuple([post, nompp]),
        t.tuple([post, fcib]),
        t.tuple([nompp, fcib]),
        t.tuple([post, nompp, fcib]),
        t.tuple([post, fciq]),
        t.tuple([nompp, fciq]),
        t.tuple([post, nompp, fciq]),
    ]),
    (a) => a.join(','),
)

export const AddOrderRequest = t.intersection([
    t.type({
        pair: t.string,
        type: t.keyof({
            buy: null,
            sell: null,
        }),
        ordertype: OrderType,
        volume: t.number,
    }),
    t.partial({
        price: t.number,
        price2: t.number,
        leverage: t.number,
        oflags: OrderFlags,
        // FIXME: this is unix timestamp or "+seconds in the future"
        // starttm: t.number,
        // FIXME: this is unix timestamp or "+seconds in the future"
        // expiretm: t.number
        userref: t.number,
        // validate inputs only, do not submit order
        validate: t.boolean,
    }),
])

export type AddOrderRequest = t.TypeOf<typeof AddOrderRequest>
