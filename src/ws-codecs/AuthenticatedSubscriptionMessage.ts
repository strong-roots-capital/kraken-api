import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export const AuthenticatedSubscriptionMessage = <C extends t.Mixed>(codec: C) =>
    new t.Type<t.TypeOf<C>, string, unknown>(
        `AuthenticatedSubscriptionMessage(${codec.name})`,
        (u: unknown): u is t.InputOf<C> =>
            t.UnknownArray.is(u) && E.isRight(codec.decode(u)),
        (u, c) =>
            pipe(
                t.UnknownArray.validate(u, c),
                E.chain((u) => codec.decode(u)),
                E.fold(
                    () => t.failure(u, c),
                    (u) => t.success(u),
                ),
            ),
        JSON.stringify,
    )
