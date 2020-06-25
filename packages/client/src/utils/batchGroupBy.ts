import { groupByActionTypes, GroupByFunction } from "redux-undo"
import { nanoid, AnyAction } from "@reduxjs/toolkit"
import { batch as batchedUpdate } from "react-redux"

let inner: string | undefined

const start = (group = nanoid()) => {
  inner = group
}

const end = () => {
  inner = undefined
}

export const makeGroupBy = (actions?: AnyAction[]): GroupByFunction => {
  const defaultGroupBy = groupByActionTypes(actions)
  return (...args) => inner || defaultGroupBy(...args)
}

export const batchUndoable = (cb: () => void | Promise<void>, group?: string) => {
  start(group)
  const res = cb()
  if (res) res.then(end)
  else end()
}

export const batch = (cb: () => void | Promise<void>, group?: string) => {
  batchedUpdate(() => batchUndoable(cb, group))
}
