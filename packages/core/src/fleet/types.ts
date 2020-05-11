import { NullableArray } from "../utils"
import { ShipState, Ship } from "../ship"

export type FleetState = {
  ships: NullableArray<ShipState>
}

export type Fleet = {
  state: FleetState

  ships: NullableArray<Ship>

  fleetLosModifier: number
  aviationDetectionScore: number
  transportPoint: number
  expeditionBonus: number
}
