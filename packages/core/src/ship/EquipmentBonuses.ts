import { createEquipmentBonuses, GearData } from "equipment-bonus"

import { Ship } from "./Ship"

export { createEquipmentBonuses }
export type EquipmentBonuses = import("equipment-bonus").EquipmentBonuses

type Key = keyof EquipmentBonuses

export const subtract = (left: EquipmentBonuses, right: EquipmentBonuses) => {
  const diff: EquipmentBonuses = { ...left }

  for (const key in left) {
    diff[key as Key] = (left[key as Key] || 0) - (right[key as Key] || 0)
  }

  return diff
}
