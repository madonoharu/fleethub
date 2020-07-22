import { useMemo } from "react"
import { createSelector, AppStore } from "@reduxjs/toolkit"
import { useStore } from "react-redux"

import { cloneEntities, selectEntitiesState } from "../store"
import { publishFilesData } from "../utils"

const makePublishFile = () =>
  createSelector(
    (store: AppStore, id: string) => selectEntitiesState(store.getState()),
    (store, id) => id,
    (entitiesState, id) => {
      const cloned = cloneEntities(entitiesState, id)
      return publishFilesData(cloned)
    }
  )

export const usePublishFile = (id: string) => {
  const store = useStore()
  return useMemo(() => {
    const selector = makePublishFile()
    return () => selector(store, id)
  }, [store, id])
}
