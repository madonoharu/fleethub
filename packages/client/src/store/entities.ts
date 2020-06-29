import { nanoid, current, AppThunk, Dictionary, combineReducers } from "@reduxjs/toolkit"
import { DefaultRootState } from "react-redux"

import { filesSelectors, flatFile, isFolder, filesSlice, NormalizedFile, PlanStateWithId } from "./filesSlice"
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

export type FhEntities = {
  files: NormalizedFile[]
  plans: PlanStateWithId[]
}

export const cloneEntities = (state: DefaultRootState, id: string): FhEntities => {
  const fileEntities = filesSelectors.selectEntities(state)
  const planEntities = plansSelectors.selectEntities(state)

  const changes: Array<[string, string]> = flatFile(fileEntities, id).map((file) => [file.id, nanoid()])

  const clonedFiles = cloneDictionary(fileEntities, changes)
  const clonedPlans = cloneDictionary(planEntities, changes)

  const folders = clonedFiles.filter(isFolder)
  changes.forEach(([prevId, nextId]) => {
    folders.forEach((folder) => {
      folder.children = replaceAll(folder.children, prevId, nextId)
    })
  })

  return { files: clonedFiles, plans: clonedPlans }
}

export const copyFile = (id: string, to?: string): AppThunk => (dispatch, getState) => {
  const state = getState()
  const cloned = cloneEntities(state, id)

  if (!to) {
    to = filesSelectors.selectAll(state).find((file) => isFolder(file) && file.children.includes(id))?.id
  }

  dispatch(filesSlice.actions.set({ ...cloned, to }))
}

export const shareFile = (id: string): AppThunk => (dispatch, getState) => {
  const state = getState()
  const cloned = cloneEntities(state, id)
  publishFiles(cloned)
}
