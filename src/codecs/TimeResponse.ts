import * as t from 'io-ts'
import { DateFromUnixTime } from 'io-ts-types'

export const TimeResponse = t.type({
    unixtime: DateFromUnixTime,
    // FIXME: this can be narrowed
    rfc1123: t.string,
})
