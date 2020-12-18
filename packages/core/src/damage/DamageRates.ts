import { NumberRecord } from "@fleethub/utils"
import { Damage } from "."
import { HitRateDetail } from "../attacks"
import { DamageModifiers, DefenseParams } from "./Damage"

type DamageRatesParams = {
  count: number
  attack: { normal: number; critical: number }
  damage: DamageModifiers
  hitRate: Pick<HitRateDetail, "normalRate" | "criticalRate">
  defense: DefenseParams
}

const calcMultipleDamageRates = (params: DamageRatesParams): NumberRecord<number> => {
  const missRate = 1 - (params.hitRate.normalRate + params.hitRate.criticalRate)

  const getDamageRatesBy = (currentHp: number, count = 1): NumberRecord<number> => {
    const defenseParams = { ...params.defense, currentHp }

    const normalDamage = new Damage({ ...params.damage, attackTerm: params.attack.normal }, defenseParams)
    const criticalDamage = new Damage({ ...params.damage, attackTerm: params.attack.critical }, defenseParams)

    const normalDamageRates = normalDamage.toDistribution().multiply(params.hitRate.normalRate)
    const criticalDamageRates = criticalDamage.toDistribution().multiply(params.hitRate.criticalRate)

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

  return getDamageRatesBy(params.defense.currentHp, params.count)
}
