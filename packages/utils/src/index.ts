export const isNonNullable = <T>(item: T): item is NonNullable<T> => item !== undefined && item !== null

export const isString = (value: unknown): value is string => typeof value === "string"

export const mapValues = <T, R>(obj: T, fn: <K extends keyof T>(value: T[K], key: K) => R) => {
  const nextObj = {} as Record<keyof T, R>

  for (const key in obj) {
    const value = obj[key]
    nextObj[key] = fn(value, key)
  }

  return nextObj
}

export const includes = <T>(array: readonly T[], value: unknown): value is T => (array as unknown[]).includes(value)

export const uniq = <T>(array: T[]) => [...new Set(array)]

export const atLeastOne = (xs: number[]) => 1 - xs.reduce((acc, x) => acc * (1 - x), 1)

export const cloneJson = <T>(json: T): T => JSON.parse(JSON.stringify(json))

export * from "./utilityTypes"
export * from "./templateLiteralTypes"

export * from "./start2"
export * from "./fhTypes"
export * from "./MasterData"
