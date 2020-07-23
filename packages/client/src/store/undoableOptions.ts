import { UndoableOptions, FilterFunction } from "redux-undo"

import { batchGroupBy } from "../utils"

import { appSlice } from "./appSlice"

const IGNORE_TIME = 200

let ignoreRapid = false
const throttlingFilter: FilterFunction = (action) => {
  console.log(action.type, ignoreRapid)
  if (ignoreRapid) return false

  ignoreRapid = true
  setTimeout(() => {
    ignoreRapid = false
  }, IGNORE_TIME)

  return true
}

export const ignoreUndoable = (cb: () => void) => {
  ignoreRapid = true
  cb()
  ignoreRapid = false
}

const actionTypeFilter: FilterFunction = (action) =>
  ["entities", appSlice.name].some((key) => (action.type as string).startsWith(key))

const filter: FilterFunction = (...args) => throttlingFilter(...args) && actionTypeFilter(...args)

const undoableOptions: UndoableOptions = {
  filter,
  groupBy: batchGroupBy,
  limit: 10,
  neverSkipReducer: true,
}

export default undoableOptions
