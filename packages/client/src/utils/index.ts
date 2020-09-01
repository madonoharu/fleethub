import { createSelectorCreator, defaultMemoize } from "reselect"
import { shallowEqual } from "react-redux"
import { Draft } from "immer"

export type Recipe<T> = (draft: Draft<T>) => void
export type Update<T> = (recipe: Recipe<T>) => void

export const withSign = (num?: number) => {
  if (!num) return ""
  return num > 0 ? `+${num}` : num.toString()
}

export const toPercent = (value: number, fractionDigits = 1) => (value * 100).toFixed(fractionDigits) + "%"

export const createShallowEqualSelector = createSelectorCreator(defaultMemoize, shallowEqual)

export * from "./FhDictionary"
export * from "./gkcoi"
export * from "./link"
export * from "./publish"
export { default as batch } from "./batch"
