import { Dict } from "@fleethub/utils"

import { ShipKey } from "../common"
import { ShipState, Ship } from "../ship"

type ShipDict = Dict<ShipKey, ShipState>

export type FleetState = ShipDict

export type NightContactChance = {
  rank1: number
  rank2: number
  rank3: number
}

export type Fleet = {
  state: FleetState

  entries: Array<[ShipKey, Ship?]>
  ships: Ship[]

  fleetLosModifier: number
  aviationDetectionScore: number
  transportPoint: number
  expeditionBonus: number

  nightContactChance: NightContactChance

  calcFighterPower: (lb?: boolean) => number
}
