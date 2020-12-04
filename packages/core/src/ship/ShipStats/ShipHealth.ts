import { Health } from "../types"

const getHealthBounds = (maxHp: number): Health["bounds"] => ({
  taiha: Math.floor(maxHp * 0.25),
  chuuha: Math.floor(maxHp * 0.5),
  shouha: Math.floor(maxHp * 0.75),
})

export const getHealthState = (maxHp: number, currentHp: number) => {
  const rate = currentHp / maxHp

  if (rate <= 0) return "Sunk"
  if (rate <= 0.25) return "Taiha"
  if (rate <= 0.5) return "Chuuha"
  if (rate <= 0.75) return "Shouha"
  return "Normal"
}

export class ShipHealth implements Health {
  public bounds: Health["bounds"]

  constructor(public readonly maxHp: number, public currentHp = maxHp) {
    this.bounds = {
      taiha: Math.floor(maxHp * 0.25),
      chuuha: Math.floor(maxHp * 0.5),
      shouha: Math.floor(maxHp * 0.75),
    }
  }

  public getStateByHp = (hp: number) => {
    const { bounds } = this

    if (hp <= 0) return "Sunk"
    if (hp <= bounds.taiha) return "Taiha"
    if (hp <= bounds.chuuha) return "Chuuha"
    if (hp <= bounds.shouha) return "Shouha"
    return "Normal"
  }

  get state() {
    const { bounds, currentHp } = this

    if (currentHp <= 0) return "Sunk"
    if (currentHp <= bounds.taiha) return "Taiha"
    if (currentHp <= bounds.chuuha) return "Chuuha"
    if (currentHp <= bounds.shouha) return "Shouha"
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
