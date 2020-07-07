import { FleetKeys, AirbaseKeys } from "../common"

import { Plan, Organization } from "./types"

export class PlanImpl implements Plan {
  public name: Plan["name"]
  public hqLevel: Plan["hqLevel"]
  public nodes: Plan["nodes"]
  public fleetType: Plan["fleetType"]
  public isEnemy: Plan["isEnemy"]

  public isCombined: Plan["isCombined"]
  public main: Plan["main"]
  public escort: Plan["escort"]

  public f1: Plan["f1"]
  public f2: Plan["f2"]
  public f3: Plan["f3"]
  public f4: Plan["f4"]

  public a1: Plan["a1"]
  public a2: Plan["a2"]
  public a3: Plan["a3"]

  constructor(public state: Plan["state"], { f1, f2, f3, f4, a1, a2, a3 }: Organization) {
    this.name = state.name || ""
    this.hqLevel = state.hqLevel || 120
    this.nodes = state.nodes || []
    this.fleetType = state.fleetType || "Single"
    this.isEnemy = state.isEnemy || false

    this.f1 = f1
    this.f2 = f2
    this.f3 = f3
    this.f4 = f4

    this.a1 = a1
    this.a2 = a2
    this.a3 = a3

    this.isCombined = this.fleetType !== "Single"
    this.main = this.f1
    this.escort = this.isCombined ? this.f2 : undefined
  }

  get fleetEntries(): Plan["fleetEntries"] {
    return FleetKeys.map((key) => [key, this[key]])
  }

  get airbaseEntries(): Plan["airbaseEntries"] {
    return AirbaseKeys.map((key) => [key, this[key]])
  }

  get airbases() {
    return AirbaseKeys.map((key) => this[key])
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
