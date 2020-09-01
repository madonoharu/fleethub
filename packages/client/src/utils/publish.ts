import { nanoid } from "@reduxjs/toolkit"
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string-uri-fix"

import { FilesData } from "../store"
import { publicStorageRef } from "../firebase"

const { origin } = window.location
const dataParamKey = "data"
const storageParamKey = "storage-file"

export const publishFilesData = async (data: FilesData) => {
  const dataStr = JSON.stringify(data)

  const url = new URL(origin)
  url.searchParams.set("data", compressToEncodedURIComponent(dataStr))

  if (url.href.length < 8000) return url.href

  url.searchParams.delete(dataParamKey)

  const storageId = nanoid()
  const res = await publicStorageRef.child(storageId).putString(dataStr, "raw", { contentType: "application/json" })
  url.searchParams.set(storageParamKey, storageId)

  return url.href
}

export const fetchUrlData = async (arg: URL | string): Promise<FilesData | undefined> => {
  const url = typeof arg === "string" ? new URL(arg) : arg

  const getParam = (key: string) => {
    const value = url.searchParams.get(key)
    url.searchParams.delete(key)
    return value
  }

  const fileId = getParam(storageParamKey)
  if (fileId) {
    const res = await fetch(`https://storage.googleapis.com/kcfleethub.appspot.com/public/${fileId}`)
    const data = await res.json()
    return data
  }

  const dataParam = getParam(dataParamKey)
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
