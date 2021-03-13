import * as t from 'io-ts'
import { NumberFromString, withEncode } from 'io-ts-types'
import { DateFromKrakenUnixTime } from '../DateFromKrakenUnixTime'

const SpreadPayload = t.tuple([
    t.string,
    t.string,
    NumberFromString.pipe(DateFromKrakenUnixTime),
    t.string,
    t.string,
])

export const SpreadMessage = withEncode(
    t.tuple([SpreadPayload, t.literal('spread'), t.string]),
    (a) => ({
        message: a[1],
        pair: a[2],
        bid: a[0][0],
        ask: a[0][1],
        timestamp: a[0][2],
        bidVolume: a[0][3],
        askVolume: a[0][4],
    }),
)

export type SpreadMessage = t.OutputOf<typeof SpreadMessage>
