import * as t from 'io-ts'

export const OrderType = t.keyof({
    market: null,
    limit: null,
    'stop-loss': null,
    'take-profit': null,
    'stop-loss-limit': null,
    'take-profit-limit': null,
    'settle-position': null,
})

export type OrderType = t.TypeOf<typeof OrderType>
