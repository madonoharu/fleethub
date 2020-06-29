import { MapNode } from "@fleethub/data"
import { Dict } from "@fleethub/utils"

import { FleetState, Fleet } from "../fleet"
import { AirbaseState, Airbase } from "../airbase"
import { Formation, FleetKey, AirbaseKey } from "../common"
import { EnemyFleetState } from "../enemy"

type FleetDict = Dict<FleetKey, FleetState>
type AirbaseDict = Dict<AirbaseKey, AirbaseState>

export type NodePlan = Pick<MapNode, "type" | "d" | "point"> & {
  name: string
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

export type Organization = Record<FleetKey, Fleet> & Record<AirbaseKey, Airbase>

export type Plan = Required<PlanStateBase> & {
  state: PlanState

  fleetEntries: Array<[FleetKey, Fleet]>
  airbaseEntries: Array<[AirbaseKey, Airbase]>

  interceptionPower: number
  highAltitudeInterceptionPower: number
} & Organization
