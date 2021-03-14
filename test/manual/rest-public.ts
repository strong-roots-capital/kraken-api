import * as T from 'fp-ts/Task'
import * as IO from 'fp-ts/IO'
import * as TE from 'fp-ts/TaskEither'
import * as Console from 'fp-ts/Console'
import { pipe, flow, constVoid } from 'fp-ts/function'

import { krakenClient } from '../../src/index'

const k = krakenClient({
    key: process.env['KEY']!,
    secret: process.env['SECRET']!,
})

const exit = (code: 0 | 1): IO.IO<void> => () => process.exit(code)

const main: T.Task<void> = pipe(
    k.AssetPairs(),
    TE.fold(
        flow(
            Console.error,
            IO.chain(() => exit(1)),
            T.fromIO,
        ),
        flow(
            Console.log,
            IO.map(constVoid),
            T.fromIO,
        ),
    ),
)

main()
