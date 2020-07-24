import { nanoid, AppThunk, Dictionary, combineReducers } from "@reduxjs/toolkit"
import { isNonNullable } from "@fleethub/utils"

import { filesSelectors, flatFile, isDirectory, filesSlice, FilesData, selectTempIds } from "./filesSlice"
import { plansSlice } from "./plansSlice"
import { selectEntitiesState } from "./selectors"
import { fetchUrlData } from "../utils"
import { ignoreUndoable } from "./undoableOptions"

export const entitiesReducer = combineReducers({
  files: filesSlice.reducer,
  plans: plansSlice.reducer,
})

export type EntitiesState = ReturnType<typeof entitiesReducer>

const replaceAll = <T>(array: T[], searchValue: T, replaceValue: T) => {
  const cloned = array.concat()

  cloned.forEach((item, index) => {
    if (item === searchValue) cloned[index] = replaceValue
  })

  return cloned
}

export const cloneFilesData = ({ id, files, plans }: FilesData): FilesData => {
  const changes: Array<[string, string]> = files.map((file) => [file.id, nanoid()])
  const nextId = changes.find((change) => change[0] === id)?.[1] || ""

  const cloneEntity = <T extends { id: string }>(entity: T) => {
    const change = changes.find(([prevId]) => entity.id === prevId)
    const nextId = change ? change[1] : ""
    return { ...entity, id: nextId }
  }

  const clonedFiles = files.map(cloneEntity)
  const clonedPlans = plans?.map(cloneEntity)

  const dirs = clonedFiles.filter(isDirectory)
  changes.forEach((change) => {
    dirs.forEach((dir) => {
      dir.children = replaceAll(dir.children, ...change)
    })
  })

  return { id: nextId, files: clonedFiles, plans: clonedPlans }
}

const toFilesData = (state: EntitiesState, id: string): FilesData => {
  const fileEntities = state.files.entities
  const planEntities = state.plans.entities

  const files = flatFile(fileEntities, id)
  const plans = files.map((file) => planEntities[file.id]).filter(isNonNullable)

  return { id, files, plans }
}

export const cloneEntities = (state: EntitiesState, id: string): FilesData => {
  const sourceData = toFilesData(state, id)
  return cloneFilesData(sourceData)
}

export const copyFile = (id: string, to?: string): AppThunk => (dispatch, getState) => {
  const state = getState()
  const cloned = cloneEntities(selectEntitiesState(state), id)

  const parentFile = cloned.files.find((file) => file.id === cloned.id)
  if (parentFile) {
    parentFile.name = parentFile.name + "-コピー"
  }

  if (!to) {
    to = filesSelectors.selectAll(state).find((file) => isDirectory(file) && file.children.includes(id))?.id
  }

  dispatch(filesSlice.actions.set({ data: cloned, to }))
}

export const cleanEntities = (): AppThunk => (dispatch, getState) => {
  const tempIds = selectTempIds(getState())
  dispatch(filesSlice.actions.remove(tempIds))
}

export const fetchLocationData = (): AppThunk => async (dispatch) => {
  const url = new URL(location.href)
  const data = await fetchUrlData(url)
  history.replaceState("", "", url.href)
  if (!data) return

  ignoreUndoable(() => {
    dispatch(filesSlice.actions.import({ data, to: "temp" }))
  })
}
