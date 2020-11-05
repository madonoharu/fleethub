import { GearId, ShipId, ShipYomi } from "@fleethub/utils"
import { createEquipmentBonuses as createBasicBonuses } from "equipment-bonus"

import { GearKey } from "../common"
import { Equipment } from "../equipment"
import { GearBase } from "../gear"
import { SpeedGroup } from "../MasterDataAdapter"
import { mapValues } from "../utils"

import { EquipmentBonuses, ShipBase } from "./types"

export type SpeedBonusParams = {
  speedGroup: SpeedGroup
  hasTurbine: boolean
  enhancedBoilerCount: number
  newModelBoilerCount: number
  hasSpecialBonus: boolean
}

export const calcSpeedBonus = ({
  speedGroup,
  hasTurbine,
  enhancedBoilerCount,
  newModelBoilerCount,
  hasSpecialBonus,
}: SpeedBonusParams) => {
  if (!hasTurbine) return 0

  const totalBoilerCount = enhancedBoilerCount + newModelBoilerCount

  if (speedGroup === "FastA") {
    if (newModelBoilerCount >= 1 || totalBoilerCount >= 2) return 10
  }

  if (speedGroup === "FastB1SlowA" && newModelBoilerCount >= 1) {
    if (totalBoilerCount >= 3) return 15
    if (totalBoilerCount >= 2) return 10
  }

  if (speedGroup === "FastB2SlowB") {
    if (newModelBoilerCount >= 2 || totalBoilerCount >= 3) return 10
  }

  if (hasSpecialBonus) {
    return 5
  }

  if (totalBoilerCount >= 1) {
    return 5
  }

  return 0
}

export const createEquipmentBonuses = (ship: ShipBase, gears: GearBase[]): EquipmentBonuses => {
  const bonuses = createBasicBonuses(ship, gears)

  const speed = calcSpeedBonus({
    speedGroup: ship.speedGroup,
    hasTurbine: gears.some((gear) => gear.gearId === GearId["改良型艦本式タービン"]),
    enhancedBoilerCount: gears.filter((gear) => gear.gearId === GearId["強化型艦本式缶"]).length,
    newModelBoilerCount: gears.filter((gear) => gear.gearId === GearId["新型高温高圧缶"]).length,
    hasSpecialBonus: ship.shipClass === "JohnCButlerClass" || ship.shipId === ShipId["夕張改二特"],
  })

  let effectiveLos: number
  const hasSmallRadar = gears.some((gear) => gear.categoryIs("SmallRadar"))
  if (hasSmallRadar) {
    const filtered = gears.filter((gear) => !gear.categoryIs("SmallRadar"))
    effectiveLos = createBasicBonuses(ship, filtered).los
  } else {
    effectiveLos = bonuses.los
  }

  return { ...bonuses, speed, effectiveLos }
}

const subtract = (left: EquipmentBonuses, right: EquipmentBonuses): EquipmentBonuses =>
  mapValues(left, (value, key) => value - right[key])

export const createShipEquipmentBonuses = (ship: ShipBase, equipment: Equipment) => {
  const bonuses = createEquipmentBonuses(ship, equipment.gears)

  const makeGetNextBonuses = (excludedKey: GearKey) => {
    const filtered = equipment.filter((gear, key) => key !== excludedKey)
    const current = createEquipmentBonuses(ship, filtered)

    return (gear: GearBase) => {
      const next = createEquipmentBonuses(ship, [...filtered, gear])
      return subtract(next, current)
    }
  }

  return { bonuses, makeGetNextBonuses }
}
