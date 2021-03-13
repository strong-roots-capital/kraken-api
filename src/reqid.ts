import * as IO from 'fp-ts/IO'
import { randomInt } from 'fp-ts/Random'
import { KrakenMaximumReqid } from './constants'

const reqID = randomInt(1, KrakenMaximumReqid)

// note: highly stateful
const consumedReqIDs = new Set<number>()

// avoid reqid collisions
export const safeReqID: IO.IO<number> = () => {
    let reqid = -1
    while (reqid === -1) {
        const draw = reqID()
        if (consumedReqIDs.has(draw)) {
            continue
        }
        consumedReqIDs.add(draw)
        reqid = draw
    }

    return reqid
}
