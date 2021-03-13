import * as t from 'io-ts'

export const SubscriptionChannel = t.keyof({
    // ticker: null,
    ohlc: null,
    // trade: null,
    spread: null,
    // book: null,
})

export type SubscriptionChannel = t.TypeOf<typeof SubscriptionChannel>
