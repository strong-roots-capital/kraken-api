import * as t from 'io-ts'
import { KrakenError } from './KrakenError'
import { DateFromUnixTime } from 'io-ts-types'

export const TimeResponse = t.type({
    error: KrakenError,
    result: t.type({
        unixtime: DateFromUnixTime,
        // FIXME: this can be narrowed
        rfc1123: t.string,
    }),
})
