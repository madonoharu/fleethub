import { Health } from "../types"

export class ShipHealth implements Health {
  constructor(public readonly maxHp: number, public currentHp = maxHp) {}

  get damage() {
    const rate = this.currentHp / this.maxHp

    if (rate <= 0) return "Sunk"
    if (rate <= 0.25) return "Taiha"
    if (rate <= 0.5) return "Chuuha"
    if (rate <= 0.75) return "Shouha"
    return "Less"
  }

  get commonPowerModifier() {
    switch (this.damage) {
      case "Less":
      case "Shouha":
        return 1
      case "Chuuha":
        return 0.7
      case "Taiha":
        return 0.4
    }
    return 0
  }

  get torpedoPowerModifier() {
    switch (this.damage) {
      case "Less":
      case "Shouha":
        return 1
      case "Chuuha":
        return 0.8
    }
    return 0
  }
}
