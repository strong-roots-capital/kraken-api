import * as t from 'io-ts'

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
