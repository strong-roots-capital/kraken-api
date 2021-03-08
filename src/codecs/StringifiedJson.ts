import * as t from 'io-ts'
import * as E from 'fp-ts/Either'
import { pipe, constFalse, constant } from 'fp-ts/function'

export const StringifiedJson = <C extends t.Mixed>(codec: C) =>
    new t.Type<t.TypeOf<C>, t.OutputOf<C>, t.InputOf<C>>(
        `StringifiedJSON(${codec.name})`,
        (u): u is t.TypeOf<C> =>
            typeof u !== 'string'
                ? false
                : pipe(
                      E.parseJSON(u, E.toError),
                      E.fold(constFalse, codec.is.bind(null)),
                  ),
        (u, c) =>
            E.either.chain(t.string.validate(u, c), (string) =>
                pipe(
                    E.parseJSON(string, E.toError),
                    E.fold(constant(t.failure(u, c)), codec.decode.bind(null)),
                ),
            ),
        // DISCUSS: should this not be to re-stringify?
        codec.encode,
    )
