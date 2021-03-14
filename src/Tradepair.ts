import * as t from 'io-ts'

export interface TradepairBrand {
    readonly Tradepair: unique symbol;
}

export const Tradepair = t.brand(
    t.string,
    (_): _ is t.Branded<string, TradepairBrand> => true,
    'Tradepair'
)

// A simplified tradepair
// @example
// "XBTUSD"
export type Tradepair = t.TypeOf<typeof Tradepair>;
