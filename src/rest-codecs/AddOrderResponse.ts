import * as t from 'io-ts'
import { nonEmptyArray } from 'io-ts-types/nonEmptyArray'

export const AddOrderResponse = t.intersection([
    t.type({
        descr: t.intersection([
            t.type({
                order: t.string,
            }),
            t.partial({
                close: t.string,
            }),
        ]),
    }),
    t.partial({
        // FIXME: a KrakenTxId
        txid: nonEmptyArray(t.string),
    }),
])

export type AddOrderResponse = t.TypeOf<typeof AddOrderResponse>
