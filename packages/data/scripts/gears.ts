import fs from "fs"
import signale from "signale"

import { Start2, MstSlotitem } from "./start2"
import { GearCategory, GearData } from "../src"

const mstItemToData = (mstItem: MstSlotitem, improvableIds: number[]): GearData => {
  const id = mstItem.api_id

  const category = mstItem.api_type[2]

  let accuracy: number | undefined
  let evasion: number | undefined
  let antiBomber: number | undefined
  let interception: number | undefined

  if (category === GearCategory.LbFighter) {
    antiBomber = mstItem.api_houm
    interception = mstItem.api_houk
  } else {
    accuracy = mstItem.api_houm
    evasion = mstItem.api_houk
  }

  const improvable = improvableIds.includes(id) || undefined

  const data: GearData = {
    id,
    category,
    iconId: mstItem.api_type[3],
    name: mstItem.api_name,

    hp: mstItem.api_taik,
    armor: mstItem.api_souk,
    firepower: mstItem.api_houg,
    torpedo: mstItem.api_raig,
    speed: mstItem.api_soku,
    bombing: mstItem.api_baku,
    antiAir: mstItem.api_tyku,
    asw: mstItem.api_tais,
    los: mstItem.api_saku,
    luck: mstItem.api_luck,

    accuracy,
    evasion,
    antiBomber,
    interception,

    range: mstItem.api_leng,
    radius: mstItem.api_distance,
    cost: mstItem.api_cost,

    improvable,
  }

  const keys = Object.keys(data) as Array<keyof typeof data>
  keys.forEach((key) => {
    if (key in data && data[key] === 0) delete data[key]
  })

  return data
}

export const writeGears = (start2: Start2, improvableIds: number[]) => {
  const gears = start2.api_mst_slotitem.map((mstItem) => mstItemToData(mstItem, improvableIds))

  fs.writeFileSync("json/gears.json", JSON.stringify(gears))
  signale.complete()
}
