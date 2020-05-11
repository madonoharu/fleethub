import { FleetState, Fleet } from "../fleet"
import { AirbaseState, Airbase } from "../airbase"

export type PlanState = {
  name: string

  fleets: FleetState[]
  airbases?: AirbaseState[]
}

export type Plan = {
  fleets: Fleet[]
  airbases: Airbase[]
}
