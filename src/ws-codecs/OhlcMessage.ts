import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/Apply'
import { NumberFromString, withEncode } from 'io-ts-types'
import { DateFromKrakenUnixTime } from '../DateFromKrakenUnixTime'

type OhlcPayload = {
    time: Date
    etime: Date
    open: string
    high: string
    low: string
    close: string
    vwap: string
    volume: string
    count: t.Int
}

const OhlcPayload = new t.Type<OhlcPayload, string, unknown>(
    'OhlcPayload',
    (u: unknown): u is OhlcPayload =>
        t
            .type({
                time: DateFromKrakenUnixTime,
                etime: DateFromKrakenUnixTime,
                open: t.string,
                high: t.string,
                low: t.string,
                close: t.string,
                vwap: t.string,
                volume: t.string,
                count: t.Int,
            })
            .is(u),
    (u, c) =>
        pipe(
            t.UnknownArray.validate(u, c),
            E.chain((u) =>
                pipe(
                    {
                        time: NumberFromString.pipe(
                            DateFromKrakenUnixTime,
                        ).validate(u[0], c),
                        etime: NumberFromString.pipe(
                            DateFromKrakenUnixTime,
                        ).validate(u[1], c),
                        open: t.string.validate(u[2], c),
                        high: t.string.validate(u[3], c),
                        low: t.string.validate(u[4], c),
                        close: t.string.validate(u[5], c),
                        vwap: t.string.validate(u[6], c),
                        volume: t.string.validate(u[7], c),
                        count: t.Int.validate(u[8], c),
                    },
                    sequenceS(E.Applicative),
                ),
            ),
        ),
    JSON.stringify,
)

export const OhlcMessage = withEncode(
    t.tuple([OhlcPayload, t.string, t.string]),
    (a) => ({
        message: a[1],
        pair: a[2],
        time: a[0].time,
        etime: a[0].etime,
        open: a[0].open,
        high: a[0].high,
        low: a[0].low,
        close: a[0].close,
        vwap: a[0].vwap,
        volume: a[0].volume,
        count: a[0].count,
    }),
)

export type OhlcMessage = t.OutputOf<typeof OhlcMessage>
