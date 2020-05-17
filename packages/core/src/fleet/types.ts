import { NullableArray } from "../utils"
import { ShipState, Ship } from "../ship"

export type ShipKey = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7"

type ShipRecord = Partial<Record<ShipKey, ShipState>>

export type FleetState = ShipRecord

export type Fleet = {
  state: FleetState

  ships: NullableArray<Ship>

  fleetLosModifier: number
  aviationDetectionScore: number
  transportPoint: number
  expeditionBonus: number
}
