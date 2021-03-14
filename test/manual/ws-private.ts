import { krakenPrivateWebsocket } from '../../src/index'
import { constVoid } from 'fp-ts/function'

const auth = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    key: process.env['KEY']!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    secret: process.env['SECRET']!,
}

const ws = krakenPrivateWebsocket(auth)

async function main() {
    const stream = await ws.subscribe({
        channel: 'ownTrades',
    })

    stream.subscribe(
        (a) => console.log(JSON.stringify(a, null, 2)),
        console.error,
        constVoid,
    )
}

main()
