import { Plan } from "./types"

export class PlanImpl implements Plan {
  public name: Plan["name"]
  public hqLevel: Plan["hqLevel"]
  public nodes: Plan["nodes"]

  constructor(
    public state: Plan["state"],
    public fleetEntries: Plan["fleetEntries"],
    public airbaseEntries: Plan["airbaseEntries"]
  ) {
    this.name = state.name || ""
    this.hqLevel = state.hqLevel || 120
    this.nodes = state.nodes || []
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
