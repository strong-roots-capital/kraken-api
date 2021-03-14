import * as t from 'io-ts'

export interface StringOfNumberBrand {
    readonly StringOfNumber: unique symbol;
}

export const StringOfNumber = t.brand(
    t.string,
    (a): a is t.Branded<string, StringOfNumberBrand> =>
         !Number.isNaN(+a) && a.trim() !== '',
    'StringOfNumber'
)

export type StringOfNumber = t.TypeOf<typeof StringOfNumber>;
