import * as t from 'io-ts'

// FIXME: domain can be narrowed, is a string of a number
export const BalanceResponse = t.record(t.string, t.string)

export type BalanceResponse = t.TypeOf<typeof BalanceResponse>
