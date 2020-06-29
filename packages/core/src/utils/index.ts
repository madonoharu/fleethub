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

export type NullableArray<T> = Array<T | undefined>
export type PickByValue<T, ValueType> = Pick<T, { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]>

export * from "./deckbuilder"

export * from "./GearStub"
export * from "./EquipmentMock"
export * from "./ShipMock"
export { default as ProficiencyExp } from "./ProficiencyExp"
