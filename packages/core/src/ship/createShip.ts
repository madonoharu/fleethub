import { Equipment } from "../equipment"
import { MasterShip } from "../MasterDataAdapter"

import { ShipImpl } from "./Ship"
import { createShipStats } from "./ShipStats"
import { createShipEquipmentBonuses } from "./ShipEquipmentBonuses"
import { ShipState } from "./types"

export type { ShipState }

export const createShip = (state: ShipState, master: MasterShip, equipment: Equipment) => {
  const { bonuses, makeGetNextBonuses } = createShipEquipmentBonuses(master, equipment)
  const stats = createShipStats(master, state, equipment, bonuses)

  return new ShipImpl(state, master, stats, equipment, makeGetNextBonuses)
}
