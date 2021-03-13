import * as t from 'io-ts'

export interface WebSocketTokenBrand {
    readonly WebSocketToken: unique symbol
}

export const WebSocketToken = t.brand(
    t.string,
    (_): _ is t.Branded<string, WebSocketTokenBrand> => true,
    'WebSocketToken',
)

export type WebSocketToken = t.TypeOf<typeof WebSocketToken>
