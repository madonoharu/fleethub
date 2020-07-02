import { Plan } from "../plan"
import { ShipShellingCalculator, DaySpecialAttack } from "../attacks"
import RateMap from "../attacks/RateMap"
import { ShipKey } from "../common"
import { Ship } from "../ship"

export class PlanAnalyzer {
  constructor(public plan: Plan) {}

  get isCombined() {
    return this.plan.fleetType !== "Single"
  }

  get fleetLosModifier() {
    const { plan, isCombined } = this
    const main = plan.f1.fleetLosModifier

    if (!isCombined) return main
    return main + plan.f2.fleetLosModifier
  }

  public analyzeShelling = () => {
    const { plan, fleetLosModifier, isCombined } = this

    type Rec = Record<"AirSupremacy" | "AirSuperiority", RateMap<DaySpecialAttack>>

    const result = new Map<Ship, Rec>()

    const analyzeShip = (role: "Main" | "Escort") => ([key, ship]: [ShipKey, Ship?]) => {
      if (!ship) return

      const isMainFlagship = key === "s1" && role === "Main"
      const { getPossibleAttacksRateMap } = new ShipShellingCalculator(ship)

      result.set(ship, {
        AirSupremacy: getPossibleAttacksRateMap(fleetLosModifier, isMainFlagship, "AirSupremacy"),
        AirSuperiority: getPossibleAttacksRateMap(fleetLosModifier, isMainFlagship, "AirSuperiority"),
      })
    }

    plan.f1.entries.forEach(analyzeShip("Main"))
    if (isCombined) plan.f2.entries.forEach(analyzeShip("Escort"))

    return result
  }
}
