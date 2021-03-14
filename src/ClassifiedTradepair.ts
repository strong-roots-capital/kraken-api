import * as t from 'io-ts'

export interface ClassifiedTradepairBrand {
    readonly ClassifiedTradepair: unique symbol
}

export const ClassifiedTradepair = t.brand(
    t.string,
    (_): _ is t.Branded<string, ClassifiedTradepairBrand> => true,
    'ClassifiedTradepair',
)

// A tradepair with the classification prefix
// https://support.kraken.com/hc/en-us/articles/360000920306-Ticker-pairs
// @example
// "XXBTZUSD"
export type ClassifiedTradepair = t.TypeOf<typeof ClassifiedTradepair>
