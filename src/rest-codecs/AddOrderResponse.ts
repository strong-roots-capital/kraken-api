import * as t from 'io-ts'
import { nonEmptyArray } from 'io-ts-types/nonEmptyArray'
import { KrakenOrderID } from '../KrakenOrderID'

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
        txid: nonEmptyArray(KrakenOrderID),
    }),
])

export type AddOrderResponse = t.TypeOf<typeof AddOrderResponse>
