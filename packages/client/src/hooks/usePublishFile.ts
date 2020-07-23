import { useCallback } from "react"
import { AppStore } from "@reduxjs/toolkit"
import { useStore } from "react-redux"
import { createCachedSelector } from "re-reselect"

import { cloneEntities, selectEntitiesState } from "../store"
import { publishFilesData, createShallowEqualSelector } from "../utils"

const cachedSelector = createCachedSelector(
  (store: AppStore, id: string) => selectEntitiesState(store.getState()),
  (store, id) => id,
  (state, id) => {
    const cloned = cloneEntities(state, id)
    return publishFilesData(cloned)
  }
)({
  keySelector: (state, id) => id,
  selectorCreator: createShallowEqualSelector,
})

export const usePublishFile = (id: string) => {
  const store = useStore()
  return useCallback((): Promise<string> => cachedSelector(store, id), [store, id])
}
