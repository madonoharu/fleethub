import { Plan, PlanStateBase, FleetKey } from "./types"

export class PlanImpl implements Plan {
  public name: Plan["name"]
  public hqLevel: Plan["hqLevel"]
  public nodes: Plan["nodes"]

  constructor(
    base: PlanStateBase,
    public fleetEntries: Plan["fleetEntries"],
    public airbaseEntries: Plan["airbaseEntries"]
  ) {
    this.name = base.name || ""
    this.hqLevel = base.hqLevel || 120
    this.nodes = base.nodes || []
  }

  get airbases() {
    return this.airbaseEntries.map((entry) => entry[1])
  }

  get interceptionPower() {
    return this.airbases.map((ab) => (ab.mode === "AirDefense" ? ab.interceptionPower : 0)).reduce((a, b) => a + b)
  }

  get highAltitudeInterceptionPower() {
    const { interceptionPower, airbases } = this

    const count = airbases
      .map((ab) => (ab.mode === "AirDefense" ? ab.highAltitudeInterceptorCount : 0))
      .reduce((a, b) => a + b)
    const modifier = [0.5, 0.8, 1.1, 1.2][count] || 1.2

    return Math.floor(interceptionPower * modifier)
  }
}
