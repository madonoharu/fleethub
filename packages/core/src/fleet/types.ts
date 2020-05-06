import { NullableArray } from "../utils"
import { ShipState } from "../ship"

export type Fleet = {
  fleetLosModifier: number
  aviationDetectionScore: number
  transportPoint: number
  expeditionBonus: number
}

export type FleetState = NullableArray<ShipState>
