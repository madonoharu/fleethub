import { NumberRecord } from "@fleethub/utils"

import { Ship } from "../ship"
import { DamageModifiers, DefenseParams } from "../damage"
import { createDaySpecialAttack, DaySpecialAttack } from "../attacks"
import { ShellingAccuracyParams, ShellingParams, ShellingPowerParams } from "../attacks/shelling/Shelling"

import { getFleetFactors } from "./FleetFactor"
import { BattleContext } from "./BattleContextImpl"

export const getShipShellingAbility = (ship: Ship, ctx: BattleContext) => {
  const { role, isFlagship, side } = ctx.getShipContext(ship)
  const isMainFlagship = role === "Main" && isFlagship
  const fleetLosModifier = side === "Player" ? ctx.player.calcFleetLosModifier() : ctx.enemy.calcFleetLosModifier()
  const airState = ctx.airState

  const observationTerm = ship.calcObservationTerm(fleetLosModifier, airState, isMainFlagship)

  const attacks = ship.getPossibleDaySpecialAttackTypes().map(createDaySpecialAttack)
  const rates = new NumberRecord<DaySpecialAttack>()

  attacks.forEach((attack) => {
    const attackRate = Math.min(observationTerm / attack.denominator, 1)
    const actualRate = (1 - rates.sum()) * attackRate
    rates.set(attack, actualRate)
  })

  return { observationTerm, rates }
}

export const getShellingParams = (
  battleContext: BattleContext,
  attacker: Ship,
  defender: Ship,
  specialAttack?: DaySpecialAttack
): ShellingParams => {
  const { engagementModifier, getShipContext } = battleContext
  const attackerCtx = getShipContext(attacker)
  const defenderCtx = getShipContext(defender)

  const formationModifiers = battleContext.getFormationModifiers(attackerCtx).shelling

  const fleetFactors = getFleetFactors(attackerCtx, defenderCtx)

  const defenderIsInstallation = defender.speed.value === 0
  const defenderIsArmored = defender.shipTypeIn("CA", "CAV", "FBB", "BB", "BBV", "CV", "CVB")

  const apShellModifiers = defenderIsArmored ? attacker.apShellModifiers : undefined

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
    specialAttackModifier: specialAttack?.power,
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
    specialAttackModifier: specialAttack?.accuracy,
  }

  const evasion = defender.calcEvasionAbility(battleContext.getFormationModifiers(defenderCtx).shelling.evasion)

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
