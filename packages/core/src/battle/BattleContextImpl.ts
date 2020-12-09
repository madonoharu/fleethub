import { mapValues } from "@fleethub/utils"

import { AirState, Engagement } from "../common"
import { fhDefinitions } from "../FhDefinitions"
import { Ship } from "../ship"
import { DaySpecialAttack } from "../attacks"
import { ShellingParams } from "../attacks/shelling/Shelling"

import { BattleFleet, ShipContext } from "./BattleFleetImpl"
import { getShellingParams } from "./shelling"

type BattleContextBase = {
  nodeType: "NightBattle"
  engagement: Engagement
  airState: AirState
  player: BattleFleet
  enemy: BattleFleet
}

type BattleModifiers = {
  power: number
  accuracy: number
  evasion: number
}

type FormationModifiers = {
  protectionRate: number
  fleetAntiAir: number
  shelling: BattleModifiers
  torpedo: BattleModifiers
  asw: BattleModifiers
  night: BattleModifiers
}

export type BattleContext = BattleContextBase & {
  engagementModifier: number
  getShipContext: (ship: Ship) => ShipContext
  getFormationModifiers: (arg: Pick<ShipContext, "side" | "position">) => FormationModifiers
}

const engagementModifierDefs: Record<Engagement, number> = {
  Parallel: 1,
  HeadOn: 0.8,
  GreenT: 1.2,
  RedT: 0.6,
}

export default class BattleContextImpl implements BattleContext {
  public airState: AirState
  public engagement: Engagement
  public player: BattleFleet
  public enemy: BattleFleet
  public nodeType: "NightBattle"

  constructor(base: BattleContextBase) {
    this.airState = base.airState
    this.engagement = base.engagement
    this.player = base.player
    this.enemy = base.enemy
    this.nodeType = base.nodeType
  }

  get engagementModifier() {
    return engagementModifierDefs[this.engagement]
  }

  public getShipContext: BattleContext["getShipContext"] = (ship) => {
    const { player, enemy } = this
    const shipCtx = player.getShipContext(ship) || enemy.getShipContext(ship)

    if (!shipCtx) {
      throw new Error("failed to getShipContext")
    }

    return shipCtx
  }

  public getFormationModifiers: BattleContext["getFormationModifiers"] = ({ side, position }) => {
    const formation = side === "Player" ? this.player.formation : this.enemy.formation
    const { protectionRate, fleetAntiAir, ...rest } = fhDefinitions.formations[formation]

    const modifiers = mapValues(rest, (value) => {
      if ("TopHalf" in value) {
        return value[position]
      }
      return value
    })

    return {
      protectionRate,
      fleetAntiAir,
      ...modifiers,
    }
  }

  public calcShellingAbility = (ship: Ship) => {
    const { role, isFlagship, side } = this.getShipContext(ship)

    const fleetLosModifier = side === "Player" ? this.player.calcFleetLosModifier() : this.enemy.calcFleetLosModifier()
    const airState = this.airState
    const isMainFlagship = role === "Main" && isFlagship

    return ship.calcShellingAbility(fleetLosModifier, airState, isMainFlagship)
  }

  public getShellingParams = (attacker: Ship, defender: Ship, specialAttack?: DaySpecialAttack): ShellingParams => {
    return getShellingParams(this, attacker, defender, specialAttack)
  }
}
