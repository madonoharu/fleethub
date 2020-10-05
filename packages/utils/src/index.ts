export const isNonNullable = <T>(item: T): item is NonNullable<T> => item !== undefined && item !== null

export const isString = (value: unknown): value is string => typeof value === "string"

export const mapValues = <T, R>(obj: T, fn: (value: T[keyof T], key: keyof T) => R): Record<keyof T, R> => {
  const nextObj: Record<string, R> = {}

  for (const key in obj) {
    const value = obj[key]
    nextObj[key] = fn(value, key)
  }

  return nextObj as Record<keyof T, R>
}

export const includes = <T>(array: readonly T[], value: unknown): value is T => (array as unknown[]).includes(value)

export const uniq = <T>(array: T[]) => [...new Set(array)]

export const atLeastOne = (xs: number[]) => 1 - xs.reduce((acc, x) => acc * (1 - x), 1)

export type Dict<K extends string | number | symbol, T> = Partial<Record<K, T>>

export type NullableArray<T> = Array<T | undefined>
export type PickByValue<T, ValueType> = Pick<T, { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]>

export * from "./start2"
export * from "./fhTypes"
export * from "./templateLiteralTypes"
