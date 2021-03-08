import { KrakenClient_ } from '../../src/index'

const k = new KrakenClient_(process.env['KEY']!, process.env['SECRET']!)

async function main() {
    console.log(await k.api('Time'))
    console.log(await k.api('Balance'))
}

main()
