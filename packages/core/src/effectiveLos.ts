import { sumBy } from "lodash-es"
import { GearCategory } from "@fleethub/data"

import { Gear } from "./gear"
import { Ship } from "./ship"

const calcGearEffectiveLos = (gear: Gear) => {
  const { category, los, improvement } = gear

  let multiplier = 0.6
  if (category === GearCategory.CbTorpedoBomber) {
    multiplier = 0.8
  } else if (category === GearCategory.CbRecon) {
    multiplier = 1
  } else if (category === GearCategory.ReconSeaplane) {
    multiplier = 1.2
  } else if (category === GearCategory.SeaplaneBomber) {
    multiplier = 1.1
  }

  return multiplier * (los + improvement.effectiveLosBonus)
}

const calcShipEffectiveLos = (ship: Ship, nodeDivaricatedFactor: number) => {
  const { los } = ship

  const equipmentTotal = ship.equipment.sumBy(calcGearEffectiveLos)
  const bonus = 0

  return Math.sqrt(los.naked + bonus) + equipmentTotal * nodeDivaricatedFactor - 2
}

const calcFleetEffectiveLos = (ships: Ship[], nodeDivaricatedFactor: number, hqLevel: number) => {
  const shipTotal = sumBy(ships, (ship) => calcShipEffectiveLos(ship, nodeDivaricatedFactor))
  return shipTotal - Math.ceil(0.4 * hqLevel) + 12
}
