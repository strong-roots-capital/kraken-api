import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/Apply'
import { NumberFromString, withEncode } from 'io-ts-types'
import { DateFromKrakenUnixTime } from '../DateFromKrakenUnixTime'

type SpreadPayload = {
    bid: string
    ask: string
    timestamp: Date
    bidVolume: string
    askVolume: string
}

const SpreadPayload = new t.Type<SpreadPayload, string, unknown>(
    'SpreadPayload',
    (u: unknown): u is SpreadPayload =>
        t
            .type({
                bid: t.string,
                ask: t.string,
                timestamp: DateFromKrakenUnixTime,
                bidVolume: t.string,
                askVolume: t.string,
            })
            .is(u),
    (u, c) =>
        pipe(
            t.UnknownArray.validate(u, c),
            E.chain((u) =>
                pipe(
                    {
                        bid: t.string.validate(u[0], c),
                        ask: t.string.validate(u[1], c),
                        timestamp: NumberFromString.pipe(
                            DateFromKrakenUnixTime,
                        ).validate(u[2], c),
                        bidVolume: t.string.validate(u[3], c),
                        askVolume: t.string.validate(u[4], c),
                    },
                    sequenceS(E.Applicative),
                ),
            ),
        ),
    JSON.stringify,
)

export const SpreadMessage = withEncode(
    t.tuple([SpreadPayload, t.literal('spread'), t.string]),
    (a) => ({
        message: a[1],
        pair: a[2],
        ...a[0],
    }),
)

export type SpreadMessage = t.OutputOf<typeof SpreadMessage>
