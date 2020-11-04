import admin from "firebase-admin"
import ky from "ky-universal"
import { MasterData } from "@fleethub/utils/src"

import getServiceAccount from "./getServiceAccount"

let app: admin.app.App | undefined
const getApp = () => {
  return (app ??= admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
    storageBucket: "kcfleethub.appspot.com",
  }))
}

const fetchStorageData = <K extends keyof MasterData>(key: K): Promise<MasterData[K]> =>
  ky.get(`https://storage.googleapis.com/kcfleethub.appspot.com/data/${key}.json`).json()

const postStorageData = <K extends keyof MasterData>(key: K, data: MasterData[K]) => {
  const str = JSON.stringify(data)

  const destination = `data/${key}.json`
  const metadata = { cacheControl: "public, max-age=60" }

  const bucket = getApp().storage().bucket()
  return bucket.file(destination).save(str, { metadata })
}

export const read = async (): Promise<MasterData> => {
  const [
    ships,
    shipTypes,
    shipClasses,
    shipAttrs,
    gears,
    gearCategories,
    gearAttrs,
    improvementBonuses,
    equippable,
  ] = await Promise.all([
    fetchStorageData("ships"),
    fetchStorageData("shipTypes"),
    fetchStorageData("shipClasses"),
    fetchStorageData("shipAttrs"),

    fetchStorageData("gears"),
    fetchStorageData("gearCategories"),
    fetchStorageData("gearAttrs"),

    fetchStorageData("improvementBonuses"),
    fetchStorageData("equippable"),
  ])

  return {
    ships,
    shipTypes,
    shipClasses,
    shipAttrs,
    gearCategories,
    gears,
    gearAttrs,
    improvementBonuses,
    equippable,
  }
}

export const write = async (md: Partial<MasterData>) => {
  const keys = Object.keys(md) as (keyof MasterData)[]

  const promises = keys.map((key) => {
    const data = md[key]
    return data && postStorageData(key, data)
  })

  await Promise.all(promises)
}

export const update = async (updateFn: (md: MasterData) => Promise<MasterData> | MasterData) => {
  const md = await read()
  const updated = await updateFn(md)
  await write(updated)
}

export default { read, write, update }
