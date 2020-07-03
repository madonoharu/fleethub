import { Plan } from "../plan"
import { ShipShellingCalculator, ShipShellingAbility } from "../attacks"
import { ShipKey } from "../common"
import { RateMap } from "../utils"
import { Ship } from "../ship"
import { Fleet } from "../fleet"

export class PlanAnalyzer {
  constructor(public plan: Plan) {}

  get isCombined() {
    return this.plan.fleetType !== "Single"
  }

  get main() {
    return this.plan.f1
  }

  get escort() {
    return this.isCombined ? this.plan.f2 : undefined
  }

  get fleetLosModifier() {
    const { plan, isCombined } = this
    const main = plan.f1.fleetLosModifier

    if (!isCombined) return main
    return main + plan.f2.fleetLosModifier
  }

  public analyzeFleetShelling = (role: "Main" | "Escort", fleet: Fleet) => {
    const { fleetLosModifier } = fleet

    type Rec = Record<"AirSupremacy" | "AirSuperiority", ShipShellingAbility>
    const result = new Map<Ship, Rec>()

    const analyzeShip = ([key, ship]: [ShipKey, Ship?]) => {
      if (!ship) return

      const isMainFlagship = role === "Main" && key === "s1"
      const { getShipShellingAbility } = new ShipShellingCalculator(ship)

      result.set(ship, {
        AirSupremacy: getShipShellingAbility(fleetLosModifier, isMainFlagship, "AirSupremacy"),
        AirSuperiority: getShipShellingAbility(fleetLosModifier, isMainFlagship, "AirSuperiority"),
      })
    }

    fleet.entries.forEach(analyzeShip)

    return Object.assign(result, { fleetLosModifier })
  }

  public analyzeShelling = () => {
    const { main, escort } = this

    return {
      main: this.analyzeFleetShelling("Main", main),
      escort: escort && this.analyzeFleetShelling("Escort", escort),
    }
  }
}
