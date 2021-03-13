import { krakenPublicWebsocket } from '../../src/index'
import { constVoid } from 'fp-ts/function'

const ws = krakenPublicWebsocket()

async function main() {
    const stream = await ws.subscribe({
        channel: 'spread',
        pairs: ['XBT/USD'],
    })

    stream.subscribe((a) => console.log(a), console.error, constVoid)
}

main()
