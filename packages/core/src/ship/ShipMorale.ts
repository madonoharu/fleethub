export type MoraleState = "Sparkling" | "Normal" | "Orange" | "Red"

export type ShipMorale = {
  value: number
  state: MoraleState
  commonAccuracyModifier: number
  torpedoAccuracyModifier: number
  evasionModifier: number
}

export type BattleType = "shelling" | "asw" | "torpedo" | "night"

export class ShipMoraleImpl implements ShipMorale {
  constructor(public value = 49) {}

  get state() {
    const { value } = this
    if (value >= 50) return "Sparkling"
    if (value >= 30) return "Normal"
    if (value >= 20) return "Orange"
    return "Red"
  }

  get commonAccuracyModifier() {
    return { Sparkling: 1.2, Normal: 1, Orange: 0.8, Red: 0.5 }[this.state]
  }

  get torpedoAccuracyModifier() {
    return { Sparkling: 1.3, Normal: 1, Orange: 0.7, Red: 0.35 }[this.state]
  }

  get evasionModifier() {
    return { Sparkling: 0.7, Normal: 1, Orange: 1.2, Red: 1.4 }[this.state]
  }
}
