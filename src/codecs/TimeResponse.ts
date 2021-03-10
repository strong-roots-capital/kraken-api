import * as t from 'io-ts'
import { DateFromKrakenUnixTime } from './DateFromKrakenUnixTime'

export const TimeResponse = t.type({
    unixtime: DateFromKrakenUnixTime,
    // FIXME: this can be narrowed
    rfc1123: t.string,
})
