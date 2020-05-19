import { FleetState, Fleet } from "../fleet"
import { AirbaseState, Airbase } from "../airbase"

export type FleetKey = "f1" | "f2" | "f3" | "f4"

type FleetRecord = Partial<Record<FleetKey, FleetState>>

export type AirbaseKey = "a1" | "a2" | "a3"

type AirbaseRecord = Partial<Record<AirbaseKey, AirbaseState>>

export type PlanState = FleetRecord &
  AirbaseRecord & {
    name: string
  }

export type Plan = {
  fleetEntries: Array<[FleetKey, Fleet]>
  airbaseEntries: Array<[AirbaseKey, Airbase]>
}
