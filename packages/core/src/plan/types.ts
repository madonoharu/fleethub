import { MapNode } from "@fleethub/data"
import { Dict } from "@fleethub/utils"

import { FleetState, Fleet } from "../fleet"
import { AirbaseState, Airbase } from "../airbase"
import { Formation } from "../common"
import { EnemyFleetState } from "../enemy"

export type FleetKey = "f1" | "f2" | "f3" | "f4"
type FleetDict = Dict<FleetKey, FleetState>

export type AirbaseKey = "a1" | "a2" | "a3"
type AirbaseDict = Dict<AirbaseKey, AirbaseState>

export type NodePlan = Pick<MapNode, "type" | "d" | "point"> & {
  formation?: Formation
  enemy?: EnemyFleetState
  lbas?: Dict<AirbaseKey, number>
}

export type PlanStateBase = {
  name?: string
  hqLevel?: number
  nodes?: NodePlan[]
}

export type PlanState = PlanStateBase & FleetDict & AirbaseDict

export type Plan = Required<PlanStateBase> & {
  fleetEntries: Array<[FleetKey, Fleet]>
  airbaseEntries: Array<[AirbaseKey, Airbase]>

  interceptionPower: number
  highAltitudeInterceptionPower: number
}
