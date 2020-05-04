import { Equipment } from "../equipment"

import { ShipImpl, Ship } from "./Ship"
import { createShipStats } from "./ShipStats"
import { createShipEquipmentBonuses } from "./ShipEquipmentBonuses"
import { ShipState, ShipCommonBaseWithStatsBase } from "./types"

export type { ShipState }

export const createShip = (state: ShipState, base: ShipCommonBaseWithStatsBase, equipment: Equipment) => {
  const { bonuses, createNextBonusesGetter } = createShipEquipmentBonuses(base, equipment)
  const stats = createShipStats(base, state, equipment, bonuses)

  return new ShipImpl(base, stats, equipment, createNextBonusesGetter)
}
