import { GearState } from "../gear"
import { Equipment } from "../equipment"
import { NullableArray } from "../utils"

import { ShipImpl } from "./Ship"
import { ShipBase } from "./MasterShip"
import { createShipStats, ModernizationRecord, ShipStats } from "./ShipStats"
import { HealthImpl } from "./Health"

export type EquipmentState = {
  gears?: NullableArray<GearState>
  slots?: number[]
}

export type ShipState = {
  shipId: number

  level?: number
  morale?: number
  currentHp?: number
} & ModernizationRecord &
  EquipmentState

export const createShip = (state: ShipState, base: ShipBase, equipment: Equipment) => {
  const { level = 99, currentHp } = state

  const bonuses = {}
  const stats = createShipStats(level, base, equipment, state, bonuses)
  const health = new HealthImpl(stats.maxHp.displayed, currentHp)

  return new ShipImpl(base, stats, equipment, health)
}
