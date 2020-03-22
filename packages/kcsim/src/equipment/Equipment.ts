import { GearState, Gear } from "../gear"

const slotIndexes = ["slot1", "slot2", "slot3", "slot4", "slot5", "exslot"] as const
type SlotIndex = typeof slotIndexes[number]
const slotSizeIndexes = ["slotSize1", "slotSize2", "slotSize3", "slotSize4", "slotSize5"] as const
type SlotSixeIndex = typeof slotSizeIndexes[number]

type EquipmentState = Partial<Record<SlotIndex, GearState> & Record<SlotSixeIndex, number>>

type GearIteratee<R> = (gear: Gear, index: SlotIndex) => R

type EquipmentGears = Partial<Record<SlotIndex, Gear>>

type Equipment = {
  forEach: (fn: GearIteratee<void>) => void
  has: (fn: GearIteratee<boolean>) => boolean
  count: (fn?: GearIteratee<boolean>) => number
  map: <R>(fn: GearIteratee<R>) => R[]
  sumBy: (fn: GearIteratee<number>) => number
}

class EquipmentImpl implements Equipment {
  private entries: Array<[Gear, SlotIndex]> = []

  constructor(gears: EquipmentGears) {
    slotIndexes.forEach(index => {
      const gear = gears[index]
      if (gear) this.entries.push([gear, index])
    })
  }

  public forEach = (fn: GearIteratee<void>) => this.entries.forEach(entry => fn(...entry))

  public has: Equipment["has"] = fn => this.entries.some(entry => fn(...entry))

  public count: Equipment["count"] = fn => {
    if (!fn) {
      return this.entries.length
    }

    return this.entries.filter(entry => fn(...entry)).length
  }

  public map: Equipment["map"] = fn => this.entries.map(entry => fn(...entry))

  public sumBy: Equipment["sumBy"] = fn => this.map(fn).reduce((a, b) => a + b, 0)
}
