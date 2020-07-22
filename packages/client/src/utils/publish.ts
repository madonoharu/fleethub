import { nanoid } from "@reduxjs/toolkit"
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string-uri-fix"

import { FilesData } from "../store"
import { publicStorageRef } from "../firebase"

const dataParamKey = "data"
const storageParamKey = "storage-file"

export const publishFilesData = async (data: FilesData) => {
  const dataStr = JSON.stringify(data)

  const url = new URL("http://localhost:8000")
  url.searchParams.set("data", compressToEncodedURIComponent(dataStr))

  if (url.href.length < 8000) return url.href

  url.searchParams.delete(dataParamKey)

  const storageId = nanoid()
  const res = await publicStorageRef.child(storageId).putString(dataStr, "raw", { contentType: "application/json" })
  url.searchParams.set(storageParamKey, storageId)

  return url.href
}

const getUrlParam = (key: string) => {
  const url = new URL(location.href)
  const value = url.searchParams.get(key)
  url.searchParams.delete(key)
  history.replaceState("", "", url.href)
  return value
}

export const parseUrlData = async (): Promise<FilesData | undefined> => {
  const fileId = getUrlParam(storageParamKey)
  if (fileId) {
    const data = await fetch(`https://storage.googleapis.com/kcfleethub.appspot.com/public/${fileId}`).then((res) =>
      res.json()
    )
    return data
  }

  const dataParam = getUrlParam(dataParamKey)
  if (dataParam) {
    try {
      return JSON.parse(decompressFromEncodedURIComponent(dataParam))
    } catch (error) {
      console.warn(error)
      return
    }
  }

  return
}
