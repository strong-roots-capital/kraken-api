import * as t from 'io-ts'

export const CancelOrderResponse = t.intersection([
    t.type({
        count: t.Int,
    }),
    t.partial({
        pending: t.boolean,
    })
])

export type CancelOrderResponse = t.TypeOf<typeof CancelOrderResponse>;
