import { Health } from "../types"

export class ShipHealth implements Health {
  public bounds: Health["bounds"]

  constructor(public readonly maxHp: number, public currentHp = maxHp) {
    this.bounds = {
      Taiha: Math.floor(maxHp * 0.25),
      Chuuha: Math.floor(maxHp * 0.5),
      Shouha: Math.floor(maxHp * 0.75),
    }
  }

  public getStateByHp = (hp: number) => {
    const { bounds } = this

    if (hp <= 0) return "Sunk"
    if (hp <= bounds.Taiha) return "Taiha"
    if (hp <= bounds.Chuuha) return "Chuuha"
    if (hp <= bounds.Shouha) return "Shouha"
    return "Normal"
  }

  get state() {
    const { bounds, currentHp } = this

    if (currentHp <= 0) return "Sunk"
    if (currentHp <= bounds.Taiha) return "Taiha"
    if (currentHp <= bounds.Chuuha) return "Chuuha"
    if (currentHp <= bounds.Shouha) return "Shouha"
    return "Normal"
  }

  get commonPowerModifier() {
    switch (this.state) {
      case "Normal":
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
    switch (this.state) {
      case "Normal":
      case "Shouha":
        return 1
      case "Chuuha":
        return 0.8
    }
    return 0
  }
}
