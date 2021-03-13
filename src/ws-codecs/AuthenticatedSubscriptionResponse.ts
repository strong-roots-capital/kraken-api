import * as t from 'io-ts'

export const AuthenticatedSubscriptionResponse = t.type({
    channelName: t.string,
    event: t.literal('subscriptionStatus'),
    status: t.literal('subscribed'),
    // NOTE: there are a few more properties here in the actual response
})
