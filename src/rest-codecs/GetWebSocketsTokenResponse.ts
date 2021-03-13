import * as t from 'io-ts'
import { WebSocketToken } from '../WebSocketToken'

export const GetWebSocketsTokenResponse = t.type({
    token: WebSocketToken,
    // number of seconds to expiry
    expires: t.number,
})

export type GetWebSocketsTokenResponse = t.TypeOf<typeof GetWebSocketsTokenResponse>
