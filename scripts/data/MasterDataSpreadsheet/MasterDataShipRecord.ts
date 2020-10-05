import { isNonNullable, concat, includes } from "@fleethub/utils"

import { MasterDataShip, SheetRow, StatInterval, StockGear } from "../types"

export const keyJpMap = {
  id: "id",
  name: "名前",
  ruby: "読み",
  shipType: "艦種",
  shipClass: "艦級",
  sortId: "ソートid",

  maxHp: "耐久",
  firepower: "火力",
  torpedo: "雷装",
  bombing: "爆装",
  antiAir: "対空",
  armor: "装甲",
  asw: "対潜",
  los: "索敵",
  accuracy: "命中",
  evasion: "回避",
  interception: "迎撃",
  antiBomber: "対爆",
  speed: "速力",
  luck: "運",

  range: "射程",
  radius: "半径",
  cost: "コスト",

  fuel: "燃料",
  ammo: "弾薬",

  capacity: "スロット数",
  slots: "搭載",
  stock: "装備",

  nextId: "改造後id",
  nextLevel: "改造レベル",

  category: "カテゴリ",
  iconId: "アイコン",
  improvable: "改修",
} as const

const getDefaultInterval = (): StatInterval => [null, null]

export const getDefaultMasterDataShip = (): MasterDataShip => ({
  id: 0,
  name: "",
  ruby: "",
  shipType: 0,
  shipClass: 0,

  maxHp: getDefaultInterval(),
  firepower: getDefaultInterval(),
  armor: getDefaultInterval(),
  torpedo: getDefaultInterval(),
  evasion: getDefaultInterval(),
  antiAir: getDefaultInterval(),
  asw: getDefaultInterval(),
  los: getDefaultInterval(),
  luck: getDefaultInterval(),

  speed: 0,
  range: null,
  capacity: 0,
  slots: [],
  stock: [],
})

const statIntervalKeys = ["maxHp", "firepower", "torpedo", "antiAir", "armor", "asw", "los", "evasion", "luck"] as const
const statIntervalPaths = statIntervalKeys.flatMap((key) => [concat(key, ".0"), concat(key, ".1")])

const slotIndexes = [1, 2, 3, 4, 5] as const
type SlotIndex = typeof slotIndexes[number]

const shipStatHeaderValues = statIntervalKeys.flatMap((key) => {
  const base = keyJpMap[key]
  return [concat(base, "初期"), concat(base, "最大")]
})

const slotsHeaderValues = slotIndexes.map((num) => concat("搭載", num))

const stockGearsHeaderValues = slotIndexes.flatMap((num) => {
  const base = concat("装備", num, ".")
  return [concat(base, "id"), concat(base, "改修")] as const
})

const headerValues = ([
  "id",
  "名前",
  "読み",
  "艦種",
  "艦級",
  "ソートid",
  "スロット数",
  ...shipStatHeaderValues,
  "速力",
  "射程",
  "燃料",
  "弾薬",
  "改造後id",
  "改造レベル",
  ...slotsHeaderValues,
  ...stockGearsHeaderValues,
] as const).concat()

const toNumberOrNull = (str: unknown = "") => (str === "" ? null : Number(str))

const primitiveKeys = [
  "id",
  "name",
  "ruby",
  "shipType",
  "shipClass",
  "sortId",
  "capacity",
  "speed",
  "range",
  "fuel",
  "ammo",
  "nextId",
  "nextLevel",
] as const

export type ShipsSheetHeaderValue = typeof headerValues[number]

export default class MasterDataShipRecord {
  static headerValues = headerValues

  static rowToShip = (row: SheetRow) => new MasterDataShipRecord().setRow(row).ship
  static shipToRow = (ship: MasterDataShip) => new MasterDataShipRecord(ship).toRow()

  constructor(public ship = getDefaultMasterDataShip()) {}

  public toShip = () => this.ship

  setRow = (row: SheetRow) => {
    const { ship } = this

    primitiveKeys.forEach((key) => {
      const value = row[keyJpMap[key]]
      if (value === "" || value === undefined) return

      if (includes(["name", "ruby"] as const, key)) {
        ship[key] = String(value)
        return
      }

      ship[key] = Number(value)
    })

    statIntervalKeys.forEach((key) => {
      const jp = keyJpMap[key]

      const left = toNumberOrNull(row[concat(jp, "初期")])
      const right = toNumberOrNull(row[concat(jp, "最大")])

      ship[key] = [left, right]
    })

    const shipSlotIndexes = slotIndexes.filter((i) => i <= ship.capacity)

    ship.slots = shipSlotIndexes.map((index) => toNumberOrNull(row[concat("搭載", index)]))

    ship.stock = shipSlotIndexes
      .map((index) => {
        const base = concat("装備", index)
        const gearId = toNumberOrNull(row[concat(base, ".id")])
        if (!gearId) return

        const gear: StockGear = { id: gearId }
        const stars = toNumberOrNull(row[concat(base, ".改修")])
        if (stars) gear.stars = stars

        return gear
      })
      .filter(isNonNullable)

    return this
  }

  toRow = () => {
    const { ship } = this
    const row: SheetRow = {}

    const setValue = (key: ShipsSheetHeaderValue, value?: number | string | null) => {
      if (value === undefined || value === null) return
      row[key] = String(value)
    }

    primitiveKeys.forEach((key) => {
      setValue(keyJpMap[key], ship[key])
    })

    statIntervalKeys.forEach((key) => {
      const jp = keyJpMap[key]
      const [left, right] = ship[key]

      setValue(concat(jp, "初期"), left)
      setValue(concat(jp, "最大"), right)
    })

    ship.slots.forEach((size, index) => {
      const slotIndex = (index + 1) as SlotIndex
      setValue(concat("搭載", slotIndex), size)
    })

    ship.stock.forEach(({ id, stars }, index) => {
      const slotIndex = (index + 1) as SlotIndex
      const baseKey = concat("装備", slotIndex)

      setValue(concat(baseKey, ".id"), id)
      if (stars) setValue(concat(baseKey, ".改修"), stars)
    })

    return row
  }
}
