import * as t from 'io-ts'
import { OwnTradesMessage } from './OwnTradesMessage'
import { OpenOrdersMessage } from './OpenOrdersMessage'

export const AuthenticatedChannelMessage = t.union([
    OwnTradesMessage,
    OpenOrdersMessage,
])

export type AuthenticatedChannelMessage = OwnTradesMessage | OpenOrdersMessage
