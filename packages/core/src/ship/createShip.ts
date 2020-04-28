import { createEquipmentBonuses } from "equipment-bonus"

import { Equipment } from "../equipment"

import { ShipImpl } from "./Ship"
import { createShipStats } from "./ShipStats"
import { ShipState, ShipCommonBaseWithStatsBase } from "./types"

export type { ShipState }

export const createShip = (state: ShipState, base: ShipCommonBaseWithStatsBase, equipment: Equipment) => {
  const bonuses = createEquipmentBonuses(base, equipment.gears)
  const stats = createShipStats(base, state, equipment, bonuses)

  return new ShipImpl(base, stats, equipment)
}
