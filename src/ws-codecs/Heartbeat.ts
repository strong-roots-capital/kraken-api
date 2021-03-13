import * as t from 'io-ts'

export const Heartbeat = t.type({
    event: t.literal('heartbeat'),
})
