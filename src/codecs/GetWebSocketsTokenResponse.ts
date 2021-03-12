import * as t from 'io-ts'

export const GetWebSocketsTokenResponse = t.type({
    token: t.string,
    expires: t.number,
})
