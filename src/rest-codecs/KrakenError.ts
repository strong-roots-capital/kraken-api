import * as t from 'io-ts'
import { nonEmptyArray } from 'io-ts-types'

export const KrakenError = nonEmptyArray(t.string, 'KrakenError')
export type KrakenError = t.TypeOf<typeof KrakenError>
