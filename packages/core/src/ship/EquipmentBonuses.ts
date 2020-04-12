import { createEquipmentBonuses, GearData } from "equipment-bonus"

import { Ship } from "./Ship"

export { createEquipmentBonuses }
export type EquipmentBonuses = import("equipment-bonus").EquipmentBonuses

type Key = keyof EquipmentBonuses

const subtract = (left: EquipmentBonuses, right: EquipmentBonuses) => {
  const diff: EquipmentBonuses = { ...left }

  for (const key in left) {
    diff[key as Key] = (left[key as Key] || 0) - (right[key as Key] || 0)
  }

  return diff
}

export const getNextEquipmentBonuses = (ship: Ship, omitIndex: number, gear: GearData) => {
  const shipData = { ...ship, id: ship.shipId }

  const gears = ship.equipment.filter((gear, index) => index !== omitIndex)
  const current = createEquipmentBonuses(shipData, gears)

  const next = createEquipmentBonuses(shipData, [...gears, gear])

  return subtract(next, current)
}
