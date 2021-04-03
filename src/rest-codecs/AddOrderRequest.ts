import * as t from 'io-ts'
import { OrderType } from '../OrderType'

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
        // TODO: implement all `oflags`
        // as a type that encodes to a comma-delimited-string
        oflags: t.literal('post,fciq'),
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
