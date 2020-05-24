import { Plan, PlanStateBase } from "./types"

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
}
