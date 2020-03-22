export const softcap = (cap: number, value: number) => (value <= cap ? value : cap + Math.sqrt(value - cap))

export const isNonNullable = <T>(item: T): item is NonNullable<T> => item !== undefined && item !== null

export * from "./deckbuilder"
