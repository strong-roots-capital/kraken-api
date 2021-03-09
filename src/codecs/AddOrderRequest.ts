import * as t from 'io-ts'

export const AddOrderRequest = t.intersection([
    t.type({
        pair: t.string,
        type: t.keyof({
            buy: null,
            sell: null,
        }),
        ordertype: t.keyof({
            market: null,
            limit: null,
            'stop-loss': null,
            'take-profit': null,
            'stop-loss-limit': null,
            'take-profit-limit': null,
            'settle-position': null,
        }),
        volume: t.number,
    }),
    t.partial({
        price: t.number,
        price2: t.number,
        leverage: t.number,
        // TODO: implement `oflags`
        // FIXME: this is unix timestamp or "+seconds in the future"
        // starttm: t.number,
        // FIXME: this is unix timestamp or "+seconds in the future"
        // expiretm: t.number
        userref: t.number,
        // validate inputs only, do not submit order
        validate: t.boolean,
    }),
])
