import * as t from 'io-ts'

export const CancelOrderRequest = t.type({
    txid: t.string
})

export type CancelOrderRequest = t.TypeOf<typeof CancelOrderRequest>;
