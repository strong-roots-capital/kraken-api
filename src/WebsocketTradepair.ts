import * as t from 'io-ts'

export interface WebsocketTradepairBrand {
    readonly WebsocketTradepair: unique symbol;
}

export const WebsocketTradepair = t.brand(
    t.string,
    (a): a is t.Branded<string, WebsocketTradepairBrand> => a.includes('/'),
    'WebsocketTradepair'
)

// A tradepair used in the websocket API
// @example
// "XBT/USD"
export type WebsocketTradepair = t.TypeOf<typeof WebsocketTradepair>;
