import { range } from "lodash-es"

import { GearKey } from "../common"
import { PickByValue } from "../utils"
import { Gear, GearState } from "../gear"

export type SlotKey = "slot1" | "slot2" | "slot3" | "slot4" | "slot5" | "slotx"

type GearKeyWithoutExslot = Exclude<GearKey, "gx">

export const getSlotKey = (key: GearKey) => key.replace("g", "slot") as SlotKey

export const getGearKeys = (size: number, exslot = true) => {
  const keys = range(size).map((index) => {
    const num = index + 1
    return [`g${num}`, `slot${num}`] as [GearKey, SlotKey]
  })

  if (exslot) keys.push(["gx", "slotx"])

  return keys
}

type GearIterateeArgsWithoutExslot = [Gear, GearKeyWithoutExslot, number]
type GearIterateeArgs = [Gear, GearKey, number?]

type GearIteratee<R> = (...args: GearIterateeArgs) => R

type NumberKey = keyof PickByValue<Gear, number>

export type EquipmentItem =
  | {
      key: GearKeyWithoutExslot
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

export type EquipmentState = Partial<Record<SlotKey, number> & Record<GearKey, GearState>>

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

  calcFighterPower: (recon?: boolean) => number
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

        if (item.gear.types[4] > 0) this.aircraftEntries.push(entry)
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

  public calcFighterPower = (recon = false) => {
    return this.sumBy((gear, key, slotSize) => {
      if (!slotSize || !gear.hasProficiency) {
        return 0
      }

      if (!recon && gear.is("Recon")) {
        return 0
      }

      return gear.calcFighterPower(slotSize)
    })
  }
}
