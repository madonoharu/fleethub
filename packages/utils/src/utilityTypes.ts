export type Dict<K extends string | number | symbol, T> = Partial<Record<K, T>>

export type NullableArray<T> = Array<T | undefined>

export type PickByValue<T, ValueType> = Pick<T, { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]>

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export type SheetRow = Record<string, string | number | boolean | undefined>

export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

export type ValueOf<T> = { [K in keyof T]: T[K] }[keyof T]

export type Literal = string | number | bigint | boolean

type Last<T extends unknown[]> = [unknown, ...T][T["length"]]
type Shift<T extends unknown[]> = T extends [infer _, ...infer I] ? I : []
type Pop<T extends unknown[]> = T extends [...infer I, infer _] ? I : []
