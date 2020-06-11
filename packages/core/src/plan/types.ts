import { FleetState, Fleet } from "../fleet"
import { AirbaseState, Airbase } from "../airbase"
import { Formation } from "../common"

export type FleetKey = "f1" | "f2" | "f3" | "f4"

type FleetRecord = Partial<Record<FleetKey, FleetState>>

export type AirbaseKey = "a1" | "a2" | "a3"

type AirbaseRecord = Partial<Record<AirbaseKey, AirbaseState>>

type BattleConfig = {
  formation?: Formation

  enemy: {
    formation: Formation
    main: FleetState[]
    escort?: FleetState[]
  }
}

export type PlanStateBase = {
  name?: string
  hqLevel?: number
}

export type PlanState = PlanStateBase & FleetRecord & AirbaseRecord

export type Plan = Required<PlanStateBase> & {
  fleetEntries: Array<[FleetKey, Fleet]>
  airbaseEntries: Array<[AirbaseKey, Airbase]>

  interceptionPower: number
  highAltitudeInterceptionPower: number
}
