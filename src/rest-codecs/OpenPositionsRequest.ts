import * as t from 'io-ts'
import { withFallback } from 'io-ts-types'

export const OpenPositionsRequest = t.type({
    // FIXME: add `txid`
    docalcs: withFallback(t.boolean, false),
    // FIXME: add `consolidation`
})
