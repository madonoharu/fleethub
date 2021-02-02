import { Start2 } from "kc-tools"
import { MasterData, MasterDataEquippable } from "@fleethub/utils/src"
import { GoogleSpreadsheet } from "google-spreadsheet"
import got from "got"

import getGoogleSpreadsheet from "./getGoogleSpreadsheet"
import { createShips, updateShipData } from "./ship"
import { updateGearData } from "./gear"
import storage from "./storage"
import { updateRows } from "./utils"
import { updateCloudinary } from "./cloudinary"

const fetchStart2 = async (): Promise<Start2> => {
  return got.get("https://raw.githubusercontent.com/Tibowl/api_start2/master/start2.json").json()
}

export const log = async (message: string) => {
  const doc = await getGoogleSpreadsheet()
  const sheet = doc.sheetsByTitle["管理"]
  await sheet.addRow([new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }), message])
}

const createEquippable = (start2: Start2): MasterDataEquippable => {
  const equip_exslot = start2.api_mst_equip_exslot
  const equip_ship = start2.api_mst_equip_ship
  const equip_exslot_ship = start2.api_mst_equip_exslot_ship

  const equip_stype = start2.api_mst_stype.map((stype) => {
    const id = stype.api_id
    const equip_type = Object.entries(stype.api_equip_type)
      .filter(([_, equippable]) => equippable === 1)
      .map(([category, _]) => Number(category))

    return { id, equip_type }
  })

  return { equip_stype, equip_exslot, equip_ship, equip_exslot_ship }
}

const createMasterData = async (doc: GoogleSpreadsheet, start2: Start2) => {
  const [shipData, gearData] = await Promise.all([updateShipData(doc, start2), updateGearData(doc, start2)])
  const equippable = createEquippable(start2)

  const next: MasterData = {
    ...shipData,
    ...gearData,
    equippable,
  }

  return next
}

export const updateData = async () => {
  const [doc, start2] = await Promise.all([getGoogleSpreadsheet(), fetchStart2()])
  await log("Start: update_data")

  const next = await createMasterData(doc, start2)

  const keys = Object.keys(next) as (keyof MasterData)[]

  const promises = keys.map((key) => storage.update(key, () => next[key]))
  await Promise.all(promises)

  await log("Success: update_data")
}

export const updateImages = async () => {
  const [doc, start2] = await Promise.all([getGoogleSpreadsheet(), fetchStart2()])
  await log("Start: update_images")

  const bannerIds = await updateCloudinary(start2)
  const sheet = doc.sheetsByTitle["艦娘"]

  const ships = await updateRows(sheet, (rows) => {
    const ships = createShips(sheet.headerValues, rows, start2)
    ships.forEach((ship) => {
      ship.banner = bannerIds[ship.ship_id]
    })

    return ships
  })

  await storage.update("ships", () => ships)

  await log("Success: update_images")
}
