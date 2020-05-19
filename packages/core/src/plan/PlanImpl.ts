import { Plan } from "./types"

export class PlanImpl implements Plan {
  constructor(public fleetEntries: Plan["fleetEntries"], public airbaseEntries: Plan["airbaseEntries"]) {}
}
