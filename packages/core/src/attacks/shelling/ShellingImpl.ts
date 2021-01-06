import { NumberRecord } from "@fleethub/utils"
import { getHealthState } from "../../utils"
import { Damage, DamageModifiers, DefenseParams } from "../../damage"
import { EvasionAbility, HealthState } from "../../ship"
import { calcAttackPower } from "../AttackPower"
import { calcHitRate } from "../hit"

const cap = 180
const criticalRateMultiplier = 1.3

type AttackResultState = HealthState | "Miss"

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
      cap,
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

    const powerDetail = this.calcPower()
    const accuracyDetail = this.calcAccuracy()
    const evasionDetail = params.evasion

    const hitRateDetail = calcHitRate({
      criticalRateMultiplier,
      accuracyTerm: accuracyDetail.accuracyTerm,
      evasionTerm: evasionDetail.evasionTerm,
      ...params.hitRate,
    })

    const missRate = 1 - hitRateDetail.hitRate

    const getDamages = (currentHp: number) => {
      const defenseParams = { ...params.defense, currentHp }
      const normalDamage = new Damage({ ...params.damage, attackTerm: powerDetail.normal }, defenseParams)
      const criticalDamage = new Damage({ ...params.damage, attackTerm: powerDetail.critical }, defenseParams)

      return { normalDamage, criticalDamage }
    }

    const getDamageRatesBy = (currentHp: number, count = 1): NumberRecord<number> => {
      const { normalDamage, criticalDamage } = getDamages(currentHp)

      const normalDamageRates = normalDamage.toDistribution().multiply(hitRateDetail.normalRate)
      const criticalDamageRates = criticalDamage.toDistribution().multiply(hitRateDetail.criticalRate)

      const rates1 = new NumberRecord<number>().withMut((mut) => {
        mut
          .add(normalDamageRates)
          .add(criticalDamageRates)
          .add(0, missRate)
          .filter((rate) => rate > 0)
      })

      if (count === 1) return rates1

      const rates2 = new NumberRecord<number>().withMut((mut) => {
        rates1.forEach((rate1, damage1) => {
          const hp = Math.max(currentHp - damage1, 0)
          getDamageRatesBy(hp, count - 1).forEach((rate2, damage2) => {
            mut.set(damage1 + damage2, rate1 * rate2)
          })
        })
      })

      return rates2
    }

    const { normalDamage, criticalDamage } = getDamages(params.defense.currentHp)
    const damageRates = getDamageRatesBy(params.defense.currentHp, 2)

    const getAttackResultState = (damage: number): AttackResultState => {
      if (!damage) return "Miss"
      return getHealthState(params.defense.maxHp, params.defense.currentHp - damage)
    }

    const attackResultStates = new NumberRecord<AttackResultState>().withMut((mut) => {
      damageRates.forEach((rate, damage) => {
        const state = getAttackResultState(damage)
        mut.add(state, rate)
      })
    })

    return {
      powerDetail,
      accuracyDetail,
      evasionDetail,
      hitRateDetail,
      normalDamage,
      criticalDamage,
      attackResultStates,
    }
  }
}
