import { Airbase } from "./types"
import { Equipment } from "../equipment"
import { Gear } from "../gear"

const canEquip: Airbase["canEquip"] = (gear) => {
  return gear.in("CbAircraft", "Seaplane", "JetAircraft", "LbAircraft")
}

const getReconFighterPowerModifier = (gear: Gear) => {
  const { los } = gear
  if (!gear.categoryIn("LbRecon")) return 1

  if (los <= 7) return 1.12
  if (los === 8) return 1.15
  return 1.18
}

const getReconInterceptionPowerModifier = (gear: Gear) => {
  const { los } = gear
  if (gear.categoryIn("CbRecon")) {
    if (los <= 7) return 1.2
    if (los === 8) return 1.25 // 予測値
    return 1.3
  }

  if (gear.categoryIn("LbRecon")) {
    return 1.18
  }

  if (gear.categoryIn("ReconSeaplane", "LargeFlyingBoat")) {
    if (los <= 7) return 1.1
    if (los === 8) return 1.13
    return 1.16
  }

  return 1
}

export class AirbaseImpl implements Airbase {
  constructor(public equipment: Equipment) {}

  public canEquip = canEquip

  get radius() {
    const min = Math.min(...this.equipment.map(({ radius }) => radius))
    if (min === Infinity) return 0

    const maxReconRadius = Math.max(...this.equipment.map((gear) => (gear.is("Recon") ? gear.radius : 0)))
    const reconBonus = maxReconRadius ? Math.min(Math.sqrt(maxReconRadius - min), 3) : 0

    return Math.round(min + reconBonus)
  }

  get fighterPower() {
    const total = this.equipment.sumBy((gear, key, slotSize) => {
      if (!slotSize) return 0
      const { antiAir, interception, improvement } = gear
      const proficiencyModifier = 0

      const multiplier = antiAir + 1.5 * interception + improvement.fighterPowerBonus
      return Math.floor(multiplier * Math.sqrt(slotSize) + proficiencyModifier)
    })

    if (!total) return 0

    const reconModifier = Math.max(...this.equipment.map(getReconFighterPowerModifier))
    return Math.floor(total * reconModifier)
  }

  get interceptionPower() {
    const total = this.equipment.sumBy((gear, key, slotSize) => {
      if (!slotSize) return 0
      const { antiAir, interception, antiBomber, improvement } = gear
      const proficiencyModifier = 0

      const multiplier = antiAir + interception + 2 * antiBomber + improvement.fighterPowerBonus
      return Math.floor(multiplier * Math.sqrt(slotSize) + proficiencyModifier)
    })

    if (!total) return 0

    const reconModifier = Math.max(...this.equipment.map(getReconInterceptionPowerModifier))
    return Math.floor(total * reconModifier)
  }
}
