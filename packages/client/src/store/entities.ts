import { nanoid, AppThunk, Dictionary, combineReducers } from "@reduxjs/toolkit"
import { DefaultRootState } from "react-redux"

import { filesSelectors, flatFile, isDirectory, filesSlice, FhEntities } from "./filesSlice"
import { plansSelectors, plansSlice } from "./plansSlice"
import { isNonNullable } from "@fleethub/utils"
import { publishFiles } from "../firebase"

export const entitiesReducer = combineReducers({
  files: filesSlice.reducer,
  plans: plansSlice.reducer,
})

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

export const cloneEntities = (state: DefaultRootState, entry: string): FhEntities => {
  const fileEntities = filesSelectors.selectEntities(state)
  const planEntities = plansSelectors.selectEntities(state)

  const changes: Array<[string, string]> = flatFile(fileEntities, entry).map((file) => [file.id, nanoid()])

  const clonedFiles = cloneDictionary(fileEntities, changes)
  const clonedPlans = cloneDictionary(planEntities, changes)

  const dirs = clonedFiles.filter(isDirectory)
  changes.forEach(([prevId, nextId]) => {
    dirs.forEach((dir) => {
      dir.children = replaceAll(dir.children, prevId, nextId)
    })
  })

  return { entry, files: clonedFiles, plans: clonedPlans }
}

export const copyFile = (id: string, to?: string): AppThunk => (dispatch, getState) => {
  const state = getState()
  const cloned = cloneEntities(state, id)

  if (!to) {
    to = filesSelectors.selectAll(state).find((file) => isDirectory(file) && file.children.includes(id))?.id
  }

  dispatch(filesSlice.actions.set({ ...cloned, to }))
}

export const shareFile = (id: string): AppThunk => (dispatch, getState) => {
  const state = getState()
  const cloned = cloneEntities(state, id)
  publishFiles(cloned)
}
