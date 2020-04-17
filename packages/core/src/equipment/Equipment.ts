import { Gear } from "../gear"
import { NullableArray, PickByValue, isNonNullable } from "../utils"

type GearIteratee<R> = (gear: Gear, index: number, slotSize?: number) => R

type NumberKey = keyof PickByValue<Gear, number>

export type Equipment = {
  src: NullableArray<Gear>
  size: number

  defaultSlots: number[]
  currentSlots: number[]

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
  public readonly size: number
  public readonly gears: Gear[]

  private entries: Array<[Gear, number, number?]> = []
  private aircraftEntries: Array<[Gear, number, number?]> = []

  constructor(public src: NullableArray<Gear>, public defaultSlots: number[], public currentSlots = defaultSlots) {
    this.size = defaultSlots.length + 1
    this.gears = src.filter(isNonNullable)

    src.forEach((gear, index) => {
      if (gear) this.entries.push([gear, index, currentSlots[index]])
    })

    this.entries.forEach((entry) => {
      if (entry[0].in("Aircraft")) this.aircraftEntries.push(entry)
    })
  }

  public forEach = (fn: GearIteratee<void>) => this.entries.forEach((entry) => fn(...entry))
  public filter: Equipment["filter"] = (fn) => this.entries.filter((entry) => fn(...entry)).map(([gear]) => gear)

  public map: Equipment["map"] = <R>(arg: GearIteratee<R> | NumberKey) => {
    if (typeof arg === "function") return this.entries.map((entry) => arg(...entry))
    return this.entries.map((entry) => entry[0][arg])
  }

  public sumBy: Equipment["sumBy"] = (arg) => this.map(arg).reduce((a, b) => a + b, 0)
  public maxValueBy: Equipment["maxValueBy"] = (arg) => Math.max(...this.map(arg))

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
