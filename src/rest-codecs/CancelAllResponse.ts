import * as t from 'io-ts'

export const CancelAllResponse = t.type({
    count: t.Int,
})

export type CancelAllResponse = t.TypeOf<typeof CancelAllResponse>
