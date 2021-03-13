import { krakenPublicWebsocket } from '../../src/index'
import { constVoid } from 'fp-ts/lib/function'

const ws = krakenPublicWebsocket()

async function main() {

    const stream = await ws.subscribe({
        channel: 'spread',
        pairs: ['XBT/USD'],
    })

    // RESUME:
    // TODO: stream should be strongly typed
    stream.subscribe((a) => console.log(a), console.error, constVoid)
}

main()
