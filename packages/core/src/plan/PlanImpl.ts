import { Plan, PlanStateBase, FleetKey } from "./types"

export class PlanImpl implements Plan {
  public name: Plan["name"]
  public hqLevel: Plan["hqLevel"]
  constructor(
    { name, hqLevel }: PlanStateBase,
    public fleetEntries: Plan["fleetEntries"],
    public airbaseEntries: Plan["airbaseEntries"]
  ) {
    this.name = name || ""
    this.hqLevel = hqLevel || 120
  }

  get airbases() {
    return this.airbaseEntries.map((entry) => entry[1])
  }

  private getFleet = (fleetKey: FleetKey) => {
    const fleet = this.fleetEntries.find(([key]) => key === fleetKey)?.[1]
    if (!fleet) throw "error"
    return fleet
  }

  public calcFleetFighterPower = (combinedFleetBattle = false, lb = false) => {
    const mainFp = this.getFleet("f1").calcFighterPower(lb)

    if (combinedFleetBattle || lb) {
      const escortFp = this.getFleet("f2").calcFighterPower(lb)
      return mainFp + escortFp
    }

    return mainFp
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
