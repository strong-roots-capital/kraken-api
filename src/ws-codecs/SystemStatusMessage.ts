import * as t from 'io-ts'

export const SystemStatusMessage = t.type({
    connectionID: t.number,
    event: t.literal('systemStatus'),
    status: t.keyof({
        online: null,
        maintenance: null,
        cancel_only: null,
        limit_only: null,
        post_only: null,
    }),
    version: t.string,
})
