import * as t from 'io-ts'
import { WebSocketToken } from '../WebSocketToken'

export const GetWebSocketsTokenResponse = t.type({
    token: WebSocketToken,
    // number of seconds to expiry
    expires: t.number,
})
