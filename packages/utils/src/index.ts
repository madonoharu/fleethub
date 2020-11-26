export const isNonNullable = <T>(item: T): item is NonNullable<T> => item !== undefined && item !== null

export const isString = (value: unknown): value is string => typeof value === "string"

export const mapValues = <T, R>(obj: T, fn: (value: T[keyof T], key: keyof T) => R) => {
  const nextObj = {} as Record<keyof T, R>

  for (const key in obj) {
    const value = obj[key]
    nextObj[key] = fn(value, key)
  }

  return nextObj
}

export const includes = <T>(array: readonly T[], value: unknown): value is T => (array as unknown[]).includes(value)

export const range = (n: number) => [...Array(n).keys()]

export const uniq = <T>(array: T[]) => [...new Set(array)]

export const randint = (upper: number) => Math.floor(Math.random() * (upper + 1))

export const sumBy = <T>(array: T[], iteratee: (item: T) => number) =>
  array.reduce((total, item) => total + iteratee(item), 0)

export const round = (number: number, precision?: number) => {
  precision = precision == null ? 0 : precision >= 0 ? Math.min(precision, 292) : Math.max(precision, -292)
  if (precision) {
    let pair = `${number}e`.split("e")
    const value = Math.round(+`${pair[0]}e${+pair[1] + precision}`)

    pair = `${value}e`.split("e")
    return +`${pair[0]}e${+pair[1] - precision}`
  }
  return Math.round(number)
}

export const atLeastOne = (xs: number[]) => 1 - xs.reduce((acc, x) => acc * (1 - x), 1)

export const cloneJson = <T>(json: T): T => JSON.parse(JSON.stringify(json))

export const capitalize = <T extends string>(str: T) => (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>
export const uncapitalize = <T extends string>(str: T) =>
  (str.charAt(0).toLowerCase() + str.slice(1)) as Uncapitalize<T>

export * from "./utilityTypes"
export * from "./templateLiteralTypes"

export * from "./start2"
export * from "./fhTypes"
export * from "./MasterData"
