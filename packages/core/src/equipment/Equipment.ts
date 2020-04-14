import { Gear } from "../gear"
import { NullableArray, PickByValue, isNonNullable } from "../utils"

type GearIteratee<R> = (gear: Gear, index: number) => R

type NumberKey = keyof PickByValue<Gear, number>

export type Equipment = {
  src: NullableArray<Gear>
  size: number

  defaultSlots: number[]
  currentSlots: number[]

  gears: Gear[]

  forEach: (fn: GearIteratee<void>) => void
  filter: (fn: GearIteratee<boolean>) => Gear[]
  map<R>(fn: GearIteratee<R>): R[]
  map(fn: GearIteratee<number> | NumberKey): number[]

  sumBy: (fn: GearIteratee<number> | NumberKey) => number
  maxValueBy: (fn: GearIteratee<number> | NumberKey) => number

  has: (fn: GearIteratee<boolean>) => boolean
  count: (fn?: GearIteratee<boolean>) => number
}

export class EquipmentImpl implements Equipment {
  public readonly size: number
  public readonly gears: Gear[]

  private entries: Array<[Gear, number]> = []

  constructor(public src: NullableArray<Gear>, public defaultSlots: number[], public currentSlots = defaultSlots) {
    this.size = defaultSlots.length + 1
    this.gears = src.filter(isNonNullable)

    src.forEach((gear, index) => {
      if (gear) this.entries.push([gear, index])
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

  public has: Equipment["has"] = (fn) => this.entries.some((entry) => fn(...entry))

  public count: Equipment["count"] = (fn) => {
    if (!fn) {
      return this.entries.length
    }

    return this.entries.filter((entry) => fn(...entry)).length
  }
}
