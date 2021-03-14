import * as t from 'io-ts'
import { WebsocketTradepair } from '../WebsocketTradepair'
import { Tradepair } from '../Tradepair'
import { ClassifiedCurrency } from '../ClassifiedCurrency'
import { StringOfNumber } from '../StringOfNumber'

export const Asset = t.intersection([
    t.type({
        altname: Tradepair,
        // This might just be t.literal('currency')?
        aclass_base: t.string,
        base: ClassifiedCurrency,
        aclass_quote: t.string,
        quote: ClassifiedCurrency,
        // This might just be t.literal('unit')?
        lot: t.string,
        // The number of decimals in the orderbook for the quote currency
        pair_decimals: t.Int,
        // The number of decimals in the orderbook for the base currency
        lot_decimals: t.Int,
        // This might just be t.literal(1)?
        lot_multiplier: t.Int,
        leverage_buy: t.array(t.Int),
        leverage_sell: t.array(t.Int),

        // Taker fee structure
        fees: t.array(t.tuple([t.number, t.number])),
        fee_volume_currency: ClassifiedCurrency,
        margin_call: t.number,
        margin_stop: t.number,
    }),
    t.partial({
        wsname: WebsocketTradepair,
        // Maker fee structure
        fees_maker: t.array(t.tuple([t.number, t.number])),
        ordermin: StringOfNumber,
    }),
])

export type Asset = t.TypeOf<typeof Asset>

// Domain is actually ClassifiedTradepair
export const AssetPairsResponse = t.record(t.string, Asset)

export type AssetPairsResponse = t.TypeOf<typeof AssetPairsResponse>
