import { decompressFromEncodedURIComponent } from "lz-string-uri-fix"

import { FilesData } from "../store"

const getUrlParam = (key: string) => {
  const url = new URL(location.href)
  const value = url.searchParams.get(key)
  url.searchParams.delete(key)
  history.replaceState("", "", url.href)
  return value
}

export const parseUrlData = async (): Promise<FilesData | undefined> => {
  const fileId = getUrlParam("storage-file")
  if (fileId) {
    const data = await fetch(`https://storage.googleapis.com/kcfleethub.appspot.com/public/${fileId}`).then((res) =>
      res.json()
    )
    return data
  }

  const dataParam = getUrlParam("entities")
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
