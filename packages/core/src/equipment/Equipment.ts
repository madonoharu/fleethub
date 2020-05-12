import { Gear, GearState } from "../gear"
import { PickByValue } from "../utils"
import { range } from "lodash-es"

export type EquipmentSlotKey = "slot1" | "slot2" | "slot3" | "slot4" | "slot5" | "exslot"

type EquipmentGearKeyWithoutExslot = "g1" | "g2" | "g3" | "g4" | "g5"
export type EquipmentGearKey = EquipmentGearKeyWithoutExslot | "gx"

export const getEquipmentSlotKey = (gearKey: EquipmentGearKey) => {
  if (gearKey === "gx") return "exslot"
  return gearKey.replace("g", "slot") as EquipmentSlotKey
}

export const getEquipmentKeys = (size: number) =>
  range(size)
    .map((index) => {
      const num = index + 1
      return [`g${num}`, `slot${num}`] as [EquipmentGearKey, EquipmentSlotKey]
    })
    .concat(["gx", "exslot"])

type GearIterateeArgsWithoutExslot = [Gear, EquipmentGearKeyWithoutExslot, number]
type GearIterateeArgs = [Gear, EquipmentGearKey, number?]

type GearIteratee<R> = (...args: GearIterateeArgs) => R

type NumberKey = keyof PickByValue<Gear, number>

export type EquipmentItem =
  | {
      key: EquipmentGearKeyWithoutExslot
      gear?: Gear
      currentSlotSize: number
      maxSlotSize: number
    }
  | {
      key: "gx"
      gear?: Gear
      currentSlotSize: undefined
      maxSlotSize: undefined
    }

export type EquipmentState = Partial<Record<EquipmentSlotKey, number> & Record<EquipmentGearKey, GearState>>

export type Equipment = {
  items: EquipmentItem[]

  gears: Gear[]

  forEach: (fn: GearIteratee<void>) => void
  filter: (fn: GearIteratee<boolean>) => Gear[]
  map<R>(arg: GearIteratee<R>): R[]
  map(arg: GearIteratee<number> | NumberKey): number[]

  sumBy: (arg: GearIteratee<number> | NumberKey) => number
  maxValueBy: (arg: GearIteratee<number> | NumberKey) => number

  has: (arg: GearIteratee<boolean> | number) => boolean
  count: (arg?: GearIteratee<boolean> | number) => number

  /** 0機以上の航空機 */
  hasAircraft: (arg: GearIteratee<boolean>) => boolean
  /** 0機以上の航空機 */
  countAircraft: (arg: GearIteratee<boolean>) => number
}

export class EquipmentImpl implements Equipment {
  public readonly gears: Gear[] = []

  private entries: GearIterateeArgs[] = []
  private aircraftEntries: GearIterateeArgsWithoutExslot[] = []

  constructor(public items: EquipmentItem[]) {
    items.forEach((item) => {
      if (!item.gear) return

      this.gears.push(item.gear)

      if (item.key === "gx") {
        this.entries.push([item.gear, item.key])
      } else {
        const entry: GearIterateeArgsWithoutExslot = [item.gear, item.key, item.currentSlotSize]
        this.entries.push(entry)

        if (item.gear.in("Aircraft")) this.aircraftEntries.push(entry)
      }
    })
  }

  public forEach = (fn: GearIteratee<void>) => this.entries.forEach((entry) => fn(...entry))
  public filter: Equipment["filter"] = (fn) => this.entries.filter((entry) => fn(...entry)).map(([gear]) => gear)

  public map: Equipment["map"] = <R>(arg: GearIteratee<R> | NumberKey) => {
    if (typeof arg === "function") return this.entries.map((entry) => arg(...entry))
    return this.entries.map((entry) => entry[0][arg])
  }

  public sumBy: Equipment["sumBy"] = (arg) => this.map(arg).reduce((a, b) => a + b, 0)
  public maxValueBy: Equipment["maxValueBy"] = (arg) => this.entries.length && Math.max(...this.map(arg))

  public has: Equipment["has"] = (arg) => {
    if (typeof arg === "number") {
      return this.entries.some(([gear]) => gear.gearId === arg)
    }

    return this.entries.some((entry) => arg(...entry))
  }

  public count: Equipment["count"] = (arg) => {
    if (typeof arg === "number") {
      return this.entries.filter(([gear]) => gear.gearId === arg).length
    }

    if (!arg) {
      return this.entries.length
    }

    return this.entries.filter((entry) => arg(...entry)).length
  }

  public hasAircraft: Equipment["hasAircraft"] = (arg) => {
    return this.aircraftEntries.some((entry) => Boolean(entry[1]) && arg(...entry))
  }

  public countAircraft: Equipment["countAircraft"] = (arg) => {
    return this.aircraftEntries.filter((entry) => Boolean(entry[1]) && arg(...entry)).length
  }
}
