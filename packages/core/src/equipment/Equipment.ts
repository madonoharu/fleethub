import { Gear, GearState } from "../gear"
import { PickByValue } from "../utils"
import { range } from "lodash-es"

type EquipmentKeyWithoutExslot = "g1" | "g2" | "g3" | "g4" | "g5"
type ExslotKey = "gx"
export type EquipmentKey = EquipmentKeyWithoutExslot | ExslotKey

export const getEquipmentKeys = (size: number) =>
  range(size)
    .map((index) => `g${index + 1}` as EquipmentKey)
    .concat("gx")

type GearIterateeArgsWithoutExslot = [Gear, EquipmentKeyWithoutExslot, number]
type GearIterateeArgs = [Gear, EquipmentKey, number?]

type GearIteratee<R> = (...args: GearIterateeArgs) => R

type NumberKey = keyof PickByValue<Gear, number>

export type EquipmentItem =
  | {
      key: EquipmentKeyWithoutExslot
      gear?: Gear
      currentSlotSize: number
      maxSlotSize: number
    }
  | {
      key: ExslotKey
      gear?: Gear
    }

export type EquipmentState = {
  slots?: Partial<Record<EquipmentKey, number>>
  gears?: Partial<Record<EquipmentKey, GearState>>
}

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
