import admin from "firebase-admin"
import axios from "axios"

import { MasterData } from "./types"

type UploadOptions = {
  destination: string
  metadata: Record<string, string>
}

const upload = async (source: unknown, { destination, metadata }: UploadOptions) => {
  const str = JSON.stringify(source)

  const bucket = admin.storage().bucket()
  await bucket.file(destination).save(str, { metadata })
}

export const fetchStorageData = <K extends keyof MasterData>(fileName: K) =>
  axios
    .get<MasterData[K]>(`https://storage.googleapis.com/kcfleethub.appspot.com/data/${fileName}.json`)
    .then((res) => res.data)

export const fetchMasterData = async (): Promise<MasterData> => {
  const [ships, shipTypes, shipClasses, gearCategories, gears] = await Promise.all([
    fetchStorageData("ships"),
    fetchStorageData("shipTypes"),
    fetchStorageData("shipClasses"),
    fetchStorageData("gearCategories"),
    fetchStorageData("gears"),
  ])

  return {
    ships,
    shipTypes,
    shipClasses,
    gearCategories,
    gears,
  }
}

export const postMasterData = async (md: MasterData) => {
  const dataPath = "data"
  const metadata = { cacheControl: "public, max-age=60" }

  const keys: (keyof MasterData)[] = ["ships", "shipTypes", "shipClasses", "gearCategories", "gears"]

  const promises = keys.map((key) => {
    const destination = `${dataPath}/${key}.json`
    upload(md[key], { destination, metadata })
  })

  await Promise.all(promises)
}

export const storage = { fetchMasterData, postMasterData }
