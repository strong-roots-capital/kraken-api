import * as t from 'io-ts'
import { StringOfNumber } from '../StringOfNumber'

// FIXME: domain is a Tradepair
export const BalanceResponse = t.record(t.string, StringOfNumber)

export type BalanceResponse = t.TypeOf<typeof BalanceResponse>
