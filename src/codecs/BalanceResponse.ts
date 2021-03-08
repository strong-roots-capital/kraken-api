import * as t from 'io-ts'
import { KrakenError } from './KrakenError'

export const BalanceResponse = t.type({
    error: KrakenError,
    // FIXME: this can be narrowed
    result: t.record(t.string, t.string),
})
