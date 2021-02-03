import admin from "firebase-admin"
import got from "got"
import { MasterData } from "@fleethub/utils/src"

import getServiceAccount from "./getServiceAccount"
import { equalJson } from "./utils"

let app: admin.app.App | undefined
const getApp = () => {
  return (app ??= admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
    storageBucket: "kcfleethub.appspot.com",
  }))
}

const read = <K extends keyof MasterData>(key: K): Promise<MasterData[K]> =>
  got.get(`https://storage.googleapis.com/kcfleethub.appspot.com/data/${key}.json`).json()

export const write = <K extends keyof MasterData>(key: K, data: MasterData[K]) => {
  const str = JSON.stringify(data)

  const destination = `data/${key}.json`
  const metadata = { cacheControl: "public, max-age=60" }

  const bucket = getApp().storage().bucket()
  return bucket.file(destination).save(str, { metadata })
}

export const update = async <K extends keyof MasterData>(
  key: K,
  cb: (current: MasterData[K]) => MasterData[K]
): Promise<MasterData[K]> => {
  const current = await read(key)
  const next = cb(current)

  if (!equalJson(current, next)) {
    await write(key, next)
  }

  return next
}

export const readMasterData = async (): Promise<MasterData> => {
  const [
    ships,
    ship_types,
    ship_classes,
    ship_attrs,
    ship_banners,
    gears,
    gear_categories,
    gear_attrs,
    ibonuses,
    equippable,
  ] = await Promise.all([
    read("ships"),
    read("ship_types"),
    read("ship_classes"),
    read("ship_attrs"),
    read("ship_banners"),
    read("gears"),
    read("gear_categories"),
    read("gear_attrs"),
    read("ibonuses"),
    read("equippable"),
  ])

  return {
    ships,
    ship_types,
    ship_classes,
    ship_attrs,
    gear_categories,
    gears,
    gear_attrs,
    ibonuses,
    equippable,
    ship_banners,
  }
}

export const writeMasterData = async (md: MasterData) => {
  const keys = Object.keys(md) as (keyof MasterData)[]

  const promises = keys.map(async (key) => {
    const current = await read(key).catch()
    const data = md[key]

    if (equalJson(current, data)) return

    await write(key, data)
  })

  await Promise.all(promises)
}

export default {
  read,
  write,
  update,
  writeMasterData,
  readMasterData,
}
