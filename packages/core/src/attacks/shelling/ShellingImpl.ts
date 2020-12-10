import { Damage, DamageModifiers, DefenseParams } from "../../damage"
import { EvasionAbility } from "../../ship"
import { calcAttackPower } from "../AttackPower"
import { calcHitRate } from "../hit"

export type ShellingPowerParams = {
  firepower: number
  improvementBonus: number
  fleetFactor: number
  airPower?: number
  healthModifier: number
  cruiserFitBonus: number
  apShellModifier?: number

  formationModifier: number
  engagementModifier: number

  specialAttackModifier?: number
  specialEnemyModifiers?: undefined
  proficiencyCriticalModifier?: number
}

export type ShellingAccuracyParams = {
  fleetFactor: number
  basicAccuracyTerm: number
  equipmentAccuracy: number
  improvementBonus: number
  fitGunBonus: number
  moraleModifier: number
  formationModifier: number

  specialAttackModifier?: number
  apShellModifier?: number
}

export type HitRateModifiers = {
  moraleModifier: number
  criticalRateMultiplier: number
  hitRateBonus?: number
  criticalRateBonus?: number
}

export type ShellingParams = {
  power: ShellingPowerParams
  accuracy: ShellingAccuracyParams
  evasion: EvasionAbility
  hitRate: HitRateModifiers
  defense: DefenseParams
  damage: DamageModifiers
}

export default class ShellingImpl {
  constructor(private params: ShellingParams) {}

  public calcPower = () => {
    const powerParams = this.params.power
    const {
      firepower,
      improvementBonus,
      fleetFactor,
      airPower,
      healthModifier,
      cruiserFitBonus,
      apShellModifier,
      formationModifier,
      engagementModifier,
      specialAttackModifier,
      proficiencyCriticalModifier,
    } = powerParams
    const basic = 5 + firepower + improvementBonus + fleetFactor

    const a14 = formationModifier * engagementModifier * healthModifier
    const b14 = cruiserFitBonus
    const a11 = specialAttackModifier

    const attackPower = calcAttackPower({
      basic,
      airPower,
      cap: 180,
      a14,
      b14,
      a11,
      apShellModifier,
      proficiencyCriticalModifier,
    })

    return { ...powerParams, ...attackPower }
  }

  public calcAccuracy = () => {
    const accuracyParams = this.params.accuracy
    const {
      fleetFactor,
      basicAccuracyTerm,
      equipmentAccuracy,
      improvementBonus,
      formationModifier,
      moraleModifier,
      fitGunBonus,
      specialAttackModifier = 1,
      apShellModifier = 1,
    } = accuracyParams

    const base = Math.floor(fleetFactor + basicAccuracyTerm + equipmentAccuracy + improvementBonus)
    const accuracyTerm = Math.floor(
      (base * formationModifier * moraleModifier + fitGunBonus) * specialAttackModifier * apShellModifier
    )

    return {
      ...accuracyParams,
      accuracyTerm,
    }
  }

  public analyze() {
    const { params } = this

    const powerProcess = this.calcPower()
    const accuracyProcess = this.calcAccuracy()
    const evasionProcess = params.evasion

    const hitRateProcess = calcHitRate({
      accuracyTerm: accuracyProcess.accuracyTerm,
      evasionTerm: evasionProcess.evasionTerm,
      ...params.hitRate,
    })

    const normalDamage = new Damage({ ...params.damage, attackTerm: powerProcess.normal }, params.defense)
    const criticalDamage = new Damage({ ...params.damage, attackTerm: powerProcess.critical }, params.defense)

    const normalPd = normalDamage.toDistribution().scale(hitRateProcess.normalRate)
    const criticalPd = criticalDamage.toDistribution().scale(hitRateProcess.criticalRate)

    const total = normalPd.add(criticalPd)

    return {
      process: {
        power: powerProcess,
        accuracy: accuracyProcess,
        evasion: evasionProcess,
        hitRate: hitRateProcess,
      },
      normalDamage,
      criticalDamage,
      total,
    }
  }
}
