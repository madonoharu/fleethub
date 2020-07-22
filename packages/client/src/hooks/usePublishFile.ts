import { useMemo } from "react"
import { createSelector, nanoid, AppStore } from "@reduxjs/toolkit"
import { useStore } from "react-redux"
import { compressToEncodedURIComponent } from "lz-string-uri-fix"

import { cloneEntities, selectEntitiesState, FilesData } from "../store"
import { publicStorageRef } from "../firebase"

const publishFilesData = async (data: FilesData) => {
  const dataStr = JSON.stringify(data)

  const url = new URL("http://localhost:8000")
  url.searchParams.set("entities", compressToEncodedURIComponent(dataStr))

  if (url.href.length < 8000) return url.href

  url.searchParams.delete("entities")

  const storageId = nanoid()
  const res = await publicStorageRef.child(storageId).putString(dataStr, "raw", { contentType: "application/json" })
  url.searchParams.set("storage-file", storageId)

  return url.href
}

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
