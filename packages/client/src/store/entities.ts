import { nanoid, AppThunk, Dictionary, combineReducers } from "@reduxjs/toolkit"
import { isNonNullable } from "@fleethub/utils"

import { filesSelectors, flatFile, isDirectory, filesSlice, FilesData } from "./filesSlice"
import { plansSlice } from "./plansSlice"
import { selectEntitiesState } from "./selectors"

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

const cloneDictionary = <T extends { id: string }>(entities: Dictionary<T>, changes: Array<[string, string]>) =>
  changes
    .map(([prevId, nextId]) => {
      const source = entities[prevId]
      if (!source) return

      return { ...source, id: nextId }
    })
    .filter(isNonNullable)

export const cloneEntities = (state: EntitiesState, id: string): FilesData => {
  const fileEntities = state.files.entities
  const planEntities = state.plans.entities

  const changes: Array<[string, string]> = flatFile(fileEntities, id).map((file) => [file.id, nanoid()])
  const nextId = changes.find((change) => change[0] === id)?.[1] || ""

  const clonedFiles = cloneDictionary(fileEntities, changes)
  const clonedPlans = cloneDictionary(planEntities, changes)

  const dirs = clonedFiles.filter(isDirectory)
  changes.forEach((change) => {
    dirs.forEach((dir) => {
      dir.children = replaceAll(dir.children, ...change)
    })
  })

  return { id: nextId, files: clonedFiles, plans: clonedPlans }
}

export const copyFile = (id: string, to?: string): AppThunk => (dispatch, getState) => {
  const state = getState()
  const cloned = cloneEntities(selectEntitiesState(state), id)

  if (!to) {
    to = filesSelectors.selectAll(state).find((file) => isDirectory(file) && file.children.includes(id))?.id
  }

  dispatch(filesSlice.actions.set({ ...cloned, to }))
}
