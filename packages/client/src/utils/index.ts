import { EntityId } from "@reduxjs/toolkit"
import { createSelectorCreator, defaultMemoize } from "reselect"
import { shallowEqual } from "react-redux"
import { Draft } from "immer"

export type Recipe<T> = (draft: Draft<T>) => void
export type Update<T> = (recipe: Recipe<T>) => void

export const withSign = (num?: number) => {
  if (!num) return ""
  return num > 0 ? "+" + num : num.toString()
}

export const createShallowEqualSelector = createSelectorCreator(defaultMemoize, shallowEqual)

export const isEntityId = (id: unknown): id is EntityId => {
  switch (typeof id) {
    case "string":
    case "number":
      return true
  }
  return false
}

export * from "./FhDictionary"
export * from "./gkcoi"
