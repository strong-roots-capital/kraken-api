import * as t from 'io-ts'

export const OpenOrdersRequest = t.partial({
    trades: t.boolean,
    userref: t.string,
})
