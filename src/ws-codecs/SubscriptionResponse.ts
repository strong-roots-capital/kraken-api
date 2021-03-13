import * as t from 'io-ts'

export const SubscriptionResponse = t.type({
    channelID: t.number,
    event: t.literal('subscriptionStatus'),
    status: t.literal('subscribed'),
    reqid: t.number,
})
