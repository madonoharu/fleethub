import { randint, range, NumberRecord } from "@fleethub/utils"

import ScratchDamage from "./ScratchDamage"
import ProtectionDamage from "./ProtectionDamage"

type DefensePowerParams = {
  armor: number
  improvementBonus: number
}

export type DamageModifiers = {
  remainingAmmoModifier?: number
  armorPenetration?: number
}

export type DamageParams = DamageModifiers & {
  attackTerm: number
}

export type DefenseParams = DefensePowerParams & {
  maxHp: number
  currentHp: number
  protection: boolean
  sinkable: boolean
}

export type DefensePower = {
  min: number
  max: number
  values: () => number[]
  random: () => number
}

const getDefensePower = (params: DefensePowerParams): DefensePower => {
  const { armor, improvementBonus } = params

  const base = armor + improvementBonus
  const min = Math.max(base, 1) * 0.7
  const max = min + Math.floor(base - 1) * 0.6

  return {
    min,
    max,
    values: () => range(Math.floor(base)).map((value) => min + value * 0.6),
    random: () => min + randint(Math.floor(base - 1)) * 0.6,
  }
}

export default class Damage {
  public defensePower: DefensePower
  public scratchDamage: ScratchDamage
  public protectionDamage: ProtectionDamage

  constructor(private readonly damageParams: DamageParams, private readonly defenseParams: DefenseParams) {
    this.defensePower = getDefensePower(defenseParams)

    const { currentHp } = defenseParams
    this.scratchDamage = new ScratchDamage(currentHp)
    this.protectionDamage = new ProtectionDamage(currentHp)
  }

  private calcUnmodifiedDamage(defenseTerm: number) {
    const { attackTerm, remainingAmmoModifier = 1, armorPenetration = 0 } = this.damageParams

    const effectiveDefenseTerm = Math.max(1, defenseTerm - armorPenetration)
    const value = Math.floor((attackTerm - effectiveDefenseTerm) * remainingAmmoModifier)
    return Math.max(0, value)
  }

  public random() {
    const { currentHp, protection, sinkable } = this.defenseParams

    const defenseTerm = this.defensePower.random()
    const unmodified = this.calcUnmodifiedDamage(defenseTerm)

    if (unmodified <= 0) return this.scratchDamage.random()
    if (protection && unmodified >= currentHp) return this.protectionDamage.random()
    if (!sinkable) return currentHp - 1
    return unmodified
  }

  private isNormalDamage(value: number) {
    if (value <= 0) return false

    const { currentHp, protection, sinkable } = this.defenseParams
    return sinkable || !protection || value < currentHp
  }

  public toDistribution(): NumberRecord<number> {
    const { scratchDamage, protectionDamage, defensePower, defenseParams } = this
    const { currentHp, protection, sinkable } = defenseParams

    const unmodifiedDamages = defensePower.values().map((dp) => this.calcUnmodifiedDamage(dp))
    const parameter = unmodifiedDamages.length

    const scratchProbability = unmodifiedDamages.filter((value) => value === 0).length / parameter
    const scratchDamagePd = scratchDamage.toDistribution().scale(scratchProbability)

    const overkillDamages = unmodifiedDamages.filter((value) => value >= currentHp)
    const overkillProbability = overkillDamages.length / parameter

    const normalDamages = unmodifiedDamages.filter((value) => this.isNormalDamage(value))
    const normalDamagePd = NumberRecord.count(normalDamages).scale(1 / parameter)

    const normalWithScratch = normalDamagePd.add(scratchDamagePd)

    if (sinkable) {
      return normalWithScratch
    }

    if (protection) {
      const protectionPd = protectionDamage.toDistribution().scale(overkillProbability)

      return normalWithScratch.add(protectionPd)
    }

    return normalWithScratch.add({ [currentHp - 1]: overkillProbability })
  }
}
