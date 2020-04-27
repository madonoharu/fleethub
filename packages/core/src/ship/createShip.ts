import { createEquipmentBonuses } from "equipment-bonus"

import { GearState } from "../gear"
import { Equipment } from "../equipment"
import { NullableArray } from "../utils"

import { ShipImpl } from "./Ship"
import { ShipCommonBaseWithStatsData } from "./MasterShip"
import { createShipStats, ModernizationRecord } from "./ShipStats"
import { HealthImpl } from "./Health"

export type ShipState = {
  shipId: number

  level?: number
  morale?: number
  currentHp?: number

  gears?: NullableArray<GearState>
  slots?: number[]
} & ModernizationRecord

export const createShip = (state: ShipState, base: ShipCommonBaseWithStatsData, equipment: Equipment) => {
  const { level = 99, currentHp } = state

  const bonuses = createEquipmentBonuses(base, equipment.gears)
  const stats = createShipStats(level, base, equipment, state, bonuses)
  const health = new HealthImpl(stats.maxHp.displayed, currentHp)

  return new ShipImpl(base, stats, equipment, health)
}
