import * as t from 'io-ts'
import { OhlcMessage } from './OhlcMessage'
import { SpreadMessage } from './SpreadMessage'

export const ChannelMessage = t.union([SpreadMessage, OhlcMessage])

export type ChannelMessage = SpreadMessage | OhlcMessage
