import * as t from 'io-ts'

export interface ClassifiedCurrencyBrand {
    readonly ClassifiedCurrency: unique symbol;
}

export const ClassifiedCurrency = t.brand(
    t.string,
    (_): _ is t.Branded<string, ClassifiedCurrencyBrand> => true,
    'ClassifiedCurrency'
)

// A currency (one-half of a tradepair) with the classification prefix
// https://support.kraken.com/hc/en-us/articles/360000920306-Ticker-pairs
// @example
// "XXBT"
export type ClassifiedCurrency = t.TypeOf<typeof ClassifiedCurrency>;
