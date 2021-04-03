import * as t from 'io-ts'

// FIXME: there's a difference between a Kraken Order ID and a
// Kraken Trade ID: one begins with an 'O' and one begins with a 'T'

const krakenOrderIDRegex = (): RegExp =>
    /^[0-9A-Z]{6}-[0-9A-Z]{5}-[0-9A-Z]{6}$/

export interface KrakenOrderIDBrand {
    readonly KrakenOrderID: unique symbol;
}

export const KrakenOrderID = t.brand(
    t.string,
    (a): a is t.Branded<string, KrakenOrderIDBrand> =>
        krakenOrderIDRegex().test(a),
    'KrakenOrderID'
)

export type KrakenOrderID = t.TypeOf<typeof KrakenOrderID>;
