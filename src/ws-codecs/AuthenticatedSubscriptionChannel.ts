import * as t from 'io-ts'

export const AuthenticatedSubscriptionChannel = t.keyof({
    ownTrades: null,
    openOrders: null,
    // addOrder: null,
    // cancelOrder: null,
    // cancelAll: null,
    // cancelAllOrdersAfter: null,
})

export type AuthenticatedSubscriptionChannel = t.TypeOf<typeof AuthenticatedSubscriptionChannel>;
