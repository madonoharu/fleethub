import { Gear } from "../gear"
import { NullableArray, PickByValue } from "../utils"

type GearIteratee<R> = (gear: Gear, index: number) => R

export type Equipment = {
  defaultSlots: number[]
  currentSlots: number[]

  forEach: (fn: GearIteratee<void>) => void
  has: (fn: GearIteratee<boolean>) => boolean
  count: (fn?: GearIteratee<boolean>) => number
  map: <R>(fn: GearIteratee<R>) => R[]
  sumBy: (fn: GearIteratee<number> | keyof PickByValue<Gear, number>) => number
}

export class EquipmentImpl implements Equipment {
  public readonly size: number

  private entries: Array<[Gear, number]> = []

  constructor(gears: NullableArray<Gear>, public defaultSlots: number[], public currentSlots = defaultSlots) {
    this.size = defaultSlots.length
    gears.forEach((gear, index) => {
      if (gear) this.entries.push([gear, index])
    })
  }

  public forEach = (fn: GearIteratee<void>) => this.entries.forEach((entry) => fn(...entry))

  public has: Equipment["has"] = (fn) => this.entries.some((entry) => fn(...entry))

  public count: Equipment["count"] = (fn) => {
    if (!fn) {
      return this.entries.length
    }

    return this.entries.filter((entry) => fn(...entry)).length
  }

  public map: Equipment["map"] = (fn) => this.entries.map((entry) => fn(...entry))

  public sumBy: Equipment["sumBy"] = (fn) => {
    if (typeof fn === "function") {
      return this.map(fn).reduce((a, b) => a + b, 0)
    }
    return this.map((gear) => gear[fn]).reduce((a, b) => a + b, 0)
  }
}
