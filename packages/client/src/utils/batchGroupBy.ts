import { groupByActionTypes, GroupByFunction } from "redux-undo"
import { nanoid } from "@reduxjs/toolkit"
import { batch as batchedUpdate } from "react-redux"

let inner: string | undefined

const start = (group = nanoid()) => {
  inner = group
}

const end = () => {
  inner = undefined
}

export const makeGroupBy = (actions?: string[]): GroupByFunction => {
  const defaultGroupBy = groupByActionTypes(actions)
  return (...args) => inner || defaultGroupBy(...args)
}

export const batchUndoable = (cb: () => void, group?: string) => {
  start(group)
  const res = cb()
  end()
}

export const batch = (cb: () => void, group?: string) => {
  batchedUpdate(() => batchUndoable(cb, group))
}
