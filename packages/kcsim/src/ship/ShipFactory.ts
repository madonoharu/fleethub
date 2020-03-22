import Ship from "./Ship"
import { ShipBase } from "./MasterShip"
import { createShipStats, ModernizationRecord } from "./ShipStat"
import { GearState, Gear } from "../gear"

const gearIndexes = ["gear1", "gear2", "gear3", "gear4", "gear5", "gearEx"] as const
type GearIndex = typeof gearIndexes[number]

const slotIndexes = ["slot1", "slot2", "slot3", "slot4", "slot5", "exslot"] as const
type SlotIndex = typeof slotIndexes[number]
const slotSizeIndexes = ["slotSize1", "slotSize2", "slotSize3", "slotSize4", "slotSize5"] as const
type SlotSixeIndex = typeof slotSizeIndexes[number]

type EquipmentState = Partial<Record<SlotIndex, GearState> & Record<SlotSixeIndex, number>>

export type ShipState = {
  shipId: number

  level?: number
  morale?: number
  currentHp?: number
} & ModernizationRecord &
  EquipmentState

class ShipFactory {
  constructor(private findBase: (id: number) => ShipBase | undefined) {}

  public create = (state: ShipState) => {
    const { shipId, level = 99 } = state
    const base = this.findBase(shipId)

    if (!base) {
      return
    }

    const { slot1, slot2, slot3, slot4, slot5 } = state

    const equipment: any = {}

    const stats = createShipStats(level, base, equipment, state, {})

    return new Ship(base, stats)
  }
}
