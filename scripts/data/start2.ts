import {
  cloneJson,
  uniq,
  MasterData,
  MasterDataGear,
  MasterDataShip,
  MasterDataShipClass,
  MasterDataEquippable,
} from "@fleethub/utils/src"
import { Start2, MstShip, MstPlayerShip, MstSlotitem } from "kc-tools"
import ky from "ky-universal"
import signale from "signale"

import { getDefaultMasterDataShip } from "./MasterDataSpreadsheet"

const isPlayerShip = (ship: MstShip): ship is MstPlayerShip => "api_houg" in ship

const getSlots = (mstShip: MstShip, shipData?: MasterDataShip) => {
  const { api_slot_num } = mstShip
  if ("api_maxeq" in mstShip) {
    const { api_maxeq } = mstShip
    return Array.from({ length: api_slot_num }, (_, i) => api_maxeq[i])
  }
  if (!shipData) {
    return new Array<number | null>(api_slot_num).fill(null)
  }
  return shipData.slots
}

export const fetchStart2 = async (): Promise<Start2> => {
  return ky.get("https://raw.githubusercontent.com/Tibowl/api_start2/master/start2.json").json()
}

const mstShipToMasterDataShip = (mstShip: MstShip): MasterDataShip => {
  const base: MasterDataShip = {
    ...getDefaultMasterDataShip(),
    id: mstShip.api_id,
    sortId: mstShip.api_sort_id,
    name: mstShip.api_name,
    yomi: mstShip.api_yomi,
    stype: mstShip.api_stype,
    speed: mstShip.api_soku,
    slotnum: mstShip.api_slot_num,
    slots: getSlots(mstShip),
    stock: [],
  }

  if (!isPlayerShip(mstShip)) return base

  const { api_aftershipid, api_afterlv, api_tais } = mstShip
  const nextId = Number(api_aftershipid)

  return {
    ...base,
    ctype: mstShip.api_ctype,

    maxHp: mstShip.api_taik,
    firepower: mstShip.api_houg,
    torpedo: mstShip.api_raig,
    antiAir: mstShip.api_tyku,
    armor: mstShip.api_souk,
    evasion: [null, null],
    asw: api_tais ? [api_tais[0], api_tais[0]] : [null, null],
    los: [null, null],
    luck: mstShip.api_luck,
    range: mstShip.api_leng,

    fuel: mstShip.api_fuel_max,
    ammo: mstShip.api_bull_max,

    nextId: nextId || undefined,
    nextLevel: api_afterlv || undefined,
  }
}

const abyssalShipNameToShipClassName = (name: string) => name.replace(/-壊|後期型|改|II| \D+mode/g, "")

export const createAbyssalShipClasses = (start2: Start2) => {
  const classNames = uniq(
    start2.api_mst_ship
      .filter((ship) => !isPlayerShip(ship))
      .map((ship) => abyssalShipNameToShipClassName(ship.api_name))
  )

  const irohaClasses: string[] = []
  const specialClasses: string[] = []

  classNames.forEach((name) => {
    if (name.includes("級")) {
      irohaClasses.push(name)
    } else {
      specialClasses.push(name)
    }
  })

  const classes: MasterDataShipClass[] = []

  irohaClasses.forEach((name, index) => {
    classes.push({ id: 1001 + index, name, key: "" })
  })

  specialClasses.forEach((name, index) => {
    classes.push({ id: 2001 + index, name, key: "" })
  })

  return classes
}

const mstItemToMasterDataGear = (item: MstSlotitem): MasterDataGear => {
  const id = item.api_id

  const type2 = item.api_type[2]

  let accuracy: number | undefined
  let evasion: number | undefined
  let antiBomber: number | undefined
  let interception: number | undefined

  if (type2 === /** 局地戦闘機 */ 48) {
    antiBomber = item.api_houm
    interception = item.api_houk
  } else {
    accuracy = item.api_houm
    evasion = item.api_houk
  }

  const gear: MasterDataGear = {
    id,
    types: item.api_type,
    name: item.api_name,

    maxHp: item.api_taik,
    armor: item.api_souk,
    firepower: item.api_houg,
    torpedo: item.api_raig,
    speed: item.api_soku,
    bombing: item.api_baku,
    antiAir: item.api_tyku,
    asw: item.api_tais,
    los: item.api_saku,
    luck: item.api_luck,

    accuracy,
    evasion,
    antiBomber,
    interception,

    range: item.api_leng,
    radius: item.api_distance,
    cost: item.api_cost,
  }

  const keys = Object.keys(gear) as Array<keyof typeof gear>
  keys.forEach((key) => {
    if (!gear[key]) delete gear[key]
  })

  return gear
}

const getEquippable = (start2: Start2): MasterDataEquippable => {
  const equip_exslot = start2.api_mst_equip_exslot
  const equip_ship = start2.api_mst_equip_ship
  const equip_exslot_ship = start2.api_mst_equip_exslot_ship

  const equip_stype = start2.api_mst_stype.map((stype) => {
    const id = stype.api_id
    const equip_type = Object.entries(stype.api_equip_type)
      .filter(([category, equippable]) => equippable === 1)
      .map(([category, equippable]) => Number(category))

    return { id, equip_type }
  })

  return { equip_stype, equip_exslot, equip_ship, equip_exslot_ship }
}

export const mergeStart2 = (md: MasterData, start2: Start2) => {
  const merged = cloneJson(md)

  const playerShipClasses = md.shipClasses.filter((sc) => sc.id < 1000)

  const abyssalShipClasses = createAbyssalShipClasses(start2).map((sc1) => {
    const key = md.shipClasses.find((sc2) => sc2.name === sc1.name)?.key
    if (key) {
      sc1.key = key
    }

    return sc1
  })

  const getAbyssalShipClass = (ship: MasterDataShip) =>
    abyssalShipClasses.find((sc) => sc.name === abyssalShipNameToShipClassName(ship.name))?.id || 0

  merged.shipClasses = playerShipClasses.concat(abyssalShipClasses)

  merged.ships = start2.api_mst_ship.map((mstShip) => {
    const current = md.ships.find(({ id }) => id === mstShip.api_id)
    const next = mstShipToMasterDataShip(mstShip)

    if (!current) {
      signale.info(`add ${mstShip.api_name}`)
      return next
    }

    const set = <K extends keyof MasterDataShip>(key: K) => {
      next[key] = current[key]
    }

    ;(["evasion", "asw", "los", "slots", "stock", "banner"] as const).forEach(set)

    if (!isPlayerShip(mstShip)) {
      ;(["ctype", "maxHp", "firepower", "torpedo", "antiAir", "armor", "luck", "range"] as const).forEach(set)

      next.ctype = getAbyssalShipClass(next)
    }

    return next
  })

  merged.gearCategories = start2.api_mst_slotitem_equiptype.map(({ api_id, api_name }) => ({
    id: api_id,
    name: api_name,
    key: md.gearCategories.find((gc) => gc.id === api_id)?.key || "",
  }))

  merged.gears = start2.api_mst_slotitem.map(mstItemToMasterDataGear).map((gear) => {
    const improvable = md.gears.find((mdg) => mdg.id === gear.id)?.improvable
    if (improvable) {
      gear.improvable = improvable
    }

    return gear
  })

  merged.equippable = getEquippable(start2)

  return merged
}