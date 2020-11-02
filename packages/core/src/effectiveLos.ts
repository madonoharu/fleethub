import { sumBy } from "lodash-es"

import { Gear } from "./gear"
import { Ship } from "./ship"

const calcGearEffectiveLos = (gear: Gear) => {
  const { categoryIs, los, improvementBonuses } = gear

  let multiplier = 0.6
  if (categoryIs("CbTorpedoBomber")) {
    multiplier = 0.8
  } else if (categoryIs("CbRecon")) {
    multiplier = 1
  } else if (categoryIs("ReconSeaplane")) {
    multiplier = 1.2
  } else if (categoryIs("SeaplaneBomber")) {
    multiplier = 1.1
  }

  return multiplier * (los + improvementBonuses.effectiveLos)
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
