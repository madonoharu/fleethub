import { Plan } from "./types"
import { Fleet } from "../fleet"
import { Airbase } from "../airbase"

export class PlanImpl implements Plan {
  constructor(public fleets: Fleet[], public airbases: Airbase[]) {}
}
