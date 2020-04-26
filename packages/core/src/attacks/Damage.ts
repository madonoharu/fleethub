export type DefensePower = {
  min: number
  max: number
}

class Damage {
  constructor(
    private readonly attackPower = 0,
    private readonly defensePower: DefensePower,
    private readonly defenderCurrentHp: number,
    private readonly remainingAmmoModifier = 1,
    private readonly armorPenetration = 0
  ) {}

  private calcValue = (defensePowerValue: number) => {
    const { attackPower, remainingAmmoModifier, armorPenetration } = this
    const effectiveDefensePower = Math.max(1, defensePowerValue - armorPenetration)
    const value = Math.floor((attackPower - effectiveDefensePower) * remainingAmmoModifier)
    return Math.max(0, value)
  }

  public get min() {
    return this.calcValue(this.defensePower.max)
  }

  public get max() {
    return this.calcValue(this.defensePower.min)
  }

  public get isDeadly() {
    const { min, defenderCurrentHp } = this
    return defenderCurrentHp <= min
  }
}
