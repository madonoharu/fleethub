import { mapValues, uncapitalize } from "@fleethub/utils"

import { Engagement } from "../common"
import { fhDefinitions } from "../FhDefinitions"
import { Ship } from "../ship"
import { getFleetFactors } from "./FleetFactor"

import { ShellingAccuracyParams, ShellingParams, ShellingPowerParams } from "../attacks/shelling/Shelling"
import { DamageModifiers, DefenseParams } from "../damage"

import { BattleFleet, ShipContext } from "./BattleFleetImpl"

type BattleContextBase = {
  engagement: Engagement
  player: BattleFleet
  enemy: BattleFleet
  nodeType: "NightBattle"
}

const engagementModifierDefs: Record<Engagement, number> = {
  Parallel: 1,
  HeadOn: 0.8,
  GreenT: 1.2,
  RedT: 0.6,
}

export default class BattleContextImpl implements BattleContextBase {
  public engagement: Engagement
  public player: BattleFleet
  public enemy: BattleFleet
  public nodeType: "NightBattle"

  private getShipContext = (ship: Ship): ShipContext => {
    const { player, enemy } = this
    const shipCtx = player.getShipContext(ship) || enemy.getShipContext(ship)

    if (!shipCtx) {
      throw new Error("failed to getShipContext")
    }

    return shipCtx
  }

  constructor(base: BattleContextBase) {
    this.engagement = base.engagement
    this.player = base.player
    this.enemy = base.enemy
    this.nodeType = base.nodeType
  }

  public getFormationModifiers = ({ side, position }: Pick<ShipContext, "side" | "position">) => {
    const formation = side === "Player" ? this.player.formation : this.enemy.formation
    const { protectionRate, fleetAntiAir, ...rest } = fhDefinitions.formations[formation]

    const modifiers = mapValues(rest, (value) => {
      if ("topHalf" in value) {
        return value[uncapitalize(position)]
      }
      return value
    })

    return {
      protectionRate,
      fleetAntiAir,
      ...modifiers,
    }
  }

  public getShellingParams = (attacker: Ship, defender: Ship): ShellingParams => {
    const { engagement } = this
    const attackerCtx = this.getShipContext(attacker)
    const defenderCtx = this.getShipContext(defender)

    const formationModifiers = this.getFormationModifiers(attackerCtx).shelling
    const engagementModifier = engagementModifierDefs[engagement]

    const fleetFactors = getFleetFactors(attackerCtx, defenderCtx)

    const defenderIsInstallation = defender.speed.value === 0
    const defenderIsArmored = defender.shipTypeIn("CA", "CAV", "FBB", "BB", "BBV", "CV", "CVB")

    const apShellModifiers = defenderIsArmored ? attacker.apShellModifiers : undefined

    const specialAttackModifiers = { power: 1, accuracy: 1 }

    const power: ShellingPowerParams = {
      formationModifier: formationModifiers.power,
      engagementModifier,
      fleetFactor: fleetFactors.shellingPower,

      firepower: attacker.firepower.value,
      improvementBonus: attacker.equipment.sumBy((gear) => gear.improvementBonuses.shellingPower),
      airPower: attacker.isCarrierLike ? attacker.calcAirPower(defenderIsInstallation) : undefined,
      healthModifier: attacker.health.commonPowerModifier,
      cruiserFitBonus: attacker.cruiserFitBonus,
      apShellModifier: apShellModifiers?.power,
      specialAttackModifier: specialAttackModifiers.power,
    }

    const accuracy: ShellingAccuracyParams = {
      fleetFactor: fleetFactors.shellingAccuracy,
      basicAccuracyTerm: attacker.basicAccuracyTerm,
      equipmentAccuracy: attacker.accuracy.equipment,
      improvementBonus: attacker.equipment.sumBy((gear) => gear.improvementBonuses.shellingAccuracy),
      moraleModifier: attacker.morale.commonAccuracyModifier,
      fitGunBonus: NaN,
      formationModifier: formationModifiers.accuracy,
      apShellModifier: apShellModifiers?.accuracy,
      specialAttackModifier: specialAttackModifiers.accuracy,
    }

    const evasion = defender.calcEvasionTerm(this.getFormationModifiers(defenderCtx).shelling.evasion)

    const hitRate = {
      moraleModifier: defender.morale.evasionModifier,
      criticalRateBonus: 0,
      criticalRateMultiplier: 0,
      hitRateBonus: 0,
    }

    const sinkable = defenderCtx.side === "Enemy"
    const protection = defenderCtx.side === "Player" && defender.morale.state !== "Red"

    const defense: DefenseParams = {
      armor: defender.armor.value,
      currentHp: defender.health.currentHp,
      maxHp: defender.health.maxHp,
      improvementBonus: defender.equipment.sumBy((gear) => gear.improvementBonuses.defensePower),
      protection,
      sinkable,
    }

    const damage: DamageModifiers = {
      remainingAmmoModifier: attacker.ammo.penalty,
    }

    return { power, accuracy, evasion, hitRate, defense, damage }
  }
}
