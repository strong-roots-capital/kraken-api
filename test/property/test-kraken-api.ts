import { testProp, fc } from 'ava-fast-check'

/**
 * Library under test
 */

import { krakenApi } from '../../src/index'

testProp.skip(
    'TODO: property-test kraken-api',
    [
        // arbitraries
        fc.nat(),
    ],
    (
        t,
        // test arguments
        natural,
    ) => {
        // ava test here
    },
    {
        verbose: true,
    },
)
