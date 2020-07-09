import { Plan } from "../plan"
import {
  getNightAbility,
  NightAbility,
  NightAttackParams,
  ShipShellingCalculator,
  ShipShellingAbility,
} from "../attacks"
import { ShipKey, AirState, Formation, BattleType, AntiAirCutin } from "../common"
import { Ship } from "../ship"
import { Fleet } from "../fleet"
import { calcContactChance } from "./Contact"
import { fhDefinitions } from "../FhDefinitions"
import { ShipAntiAirAbility, ShipAntiAirAbilityContext } from "./ShipAntiAirAbility"

export class PlanAnalyzer {
  constructor(public plan: Plan) {}

  get isCombined() {
    return this.plan.fleetType !== "Single"
  }

  get main() {
    return this.plan.main
  }

  get escort() {
    return this.plan.escort
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

  public analyzeContact = () => {
    const { main, escort } = this

    const airStates: AirState[] = ["AirSupremacy", "AirSuperiority", "AirDenial"]

    const single = airStates.map((as) => calcContactChance(main.ships, as))
    const combined = escort && airStates.map((as) => calcContactChance([...main.ships, ...escort.ships], as))

    return { single, combined }
  }

  public analyzeAntiAir = (formation: Formation, battleType: BattleType, antiAirCutin?: AntiAirCutin) => {
    const { plan, isCombined } = this
    const { isEnemy } = plan

    const formationModifier = fhDefinitions.formations[formation].fleetAntiAir
    const fleetAntiAir = plan.calcFleetAntiAir(formationModifier)

    const ctxBase: Omit<ShipAntiAirAbilityContext, "role"> = {
      isEnemy,
      isCombined,
      battleType,
      fleetAntiAir,
      antiAirCutin,
    }
    const mainCtx: ShipAntiAirAbilityContext = { ...ctxBase, role: "Main" }
    const escortCtx: ShipAntiAirAbilityContext = { ...ctxBase, role: "Escort" }

    const mainData = this.main.ships.map((ship) => new ShipAntiAirAbility(ship, mainCtx))
    const escortData = this.escort?.ships.map((ship) => new ShipAntiAirAbility(ship, escortCtx))
    const data = mainData.concat(escortData || [])

    return data
  }
}

export const analyzeNightAttacks = (fleet: Fleet, params: Omit<NightAttackParams, "isFlagship" | "damageState">) => {
  const analysis: Array<{
    ship: Ship
    normal: NightAbility
    chuuha: NightAbility
  }> = []

  fleet.entries.forEach(([key, ship]) => {
    if (!ship) return

    const isFlagship = key === "s1"
    const normal = getNightAbility(ship, { ...params, isFlagship, damageState: "Less" })

    if (!normal.attacks.length) return

    const chuuha = getNightAbility(ship, { ...params, isFlagship, damageState: "Chuuha" })
    analysis.push({ ship, normal, chuuha })
  })

  return analysis
}
