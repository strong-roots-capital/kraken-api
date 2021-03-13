import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export interface SubscriptionMessage extends Array<unknown> {
    0: t.Int
}

export const SubscriptionMessage = <C extends t.Mixed>(codec: C) =>
    new t.Type<SubscriptionMessage, string, unknown>(
        `SubscriptionMessage(${codec.name})`,
        (u: unknown): u is SubscriptionMessage =>
            t.UnknownArray.is(u) &&
            t.Int.is(u[0]) &&
            E.isRight(codec.decode(u.slice(1))),
        (u, c) =>
            pipe(
                t.UnknownArray.validate(u, c),
                E.chainFirst((u) => t.Int.validate(u[0], c)),
                E.chainFirst((u) => codec.validate(u.slice(1), c)),
                E.fold(
                    () => t.failure(u, c),
                    (u) => t.success(u as SubscriptionMessage),
                ),
            ),
        JSON.stringify,
    )
