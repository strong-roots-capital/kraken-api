import * as t from 'io-ts'

export const KrakenError = t.array(t.string)
export type KrakenError = t.TypeOf<typeof KrakenError>
