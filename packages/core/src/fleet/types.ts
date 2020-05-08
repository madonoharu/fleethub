import { NullableArray } from "../utils"
import { ShipState, Ship } from "../ship"

export type Fleet = {
  ships: NullableArray<Ship>

  fleetLosModifier: number
  aviationDetectionScore: number
  transportPoint: number
  expeditionBonus: number
}

export type FleetState = {
  ships: NullableArray<ShipState>
}
