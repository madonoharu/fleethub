export type Dict<K extends string | number | symbol, T> = Partial<Record<K, T>>

export type NullableArray<T> = Array<T | undefined>

export type PickByValue<T, ValueType> = Pick<T, { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]>

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }
