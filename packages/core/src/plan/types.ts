import { MapNode } from "@fleethub/data"
import { Dict } from "@fleethub/utils"

import { FleetState, Fleet } from "../fleet"
import { AirbaseState, Airbase } from "../airbase"
import { Formation, FleetKey, AirbaseKey, FleetType, AntiAirCutin } from "../common"
import { RateMap } from "../utils"

type FleetDict = Dict<FleetKey, FleetState>
type AirbaseDict = Dict<AirbaseKey, AirbaseState>

export type EnemyFleetState = {
  main: FleetState
  escort?: FleetState
  formation?: Formation
}

export type NodePlan = Pick<MapNode, "type" | "d" | "point"> & {
  name: string
  formation?: Formation
  enemy?: EnemyFleetState
  lbas?: Dict<AirbaseKey, number>
}

export type PlanStateBase = {
  hqLevel?: number
  nodes?: NodePlan[]
  fleetType?: FleetType
  isEnemy?: boolean
}

export type PlanState = PlanStateBase & FleetDict & AirbaseDict

export type Organization = Record<FleetKey, Fleet> & Record<AirbaseKey, Airbase>

export type Plan = Required<PlanStateBase> & {
  state: PlanState

  isCombined: boolean
  main: Fleet
  escort?: Fleet

  fleetEntries: Array<[FleetKey, Fleet]>
  airbaseEntries: Array<[AirbaseKey, Airbase]>

  interceptionPower: number
  highAltitudeInterceptionPower: number

  calcFleetAntiAir: (formationModifier: number) => number
  antiAirCutinChance: RateMap<AntiAirCutin>
} & Organization
