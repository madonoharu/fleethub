export const softcap = (cap: number, value: number) => (value <= cap ? value : cap + Math.sqrt(value - cap))

export const isNonNullable = <T>(item: T): item is NonNullable<T> => item !== undefined && item !== null

export type NullableArray<T> = Array<T | undefined>
export type PickByValue<T, ValueType> = Pick<T, { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]>

export * from "./deckbuilder"
