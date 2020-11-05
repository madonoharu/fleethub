import { ShipType, ShipId, GearId } from "@fleethub/utils"

import { Gear } from "../gear"
import { Ship } from "../ship"

export const shipTypeToTp = (shipType: ShipType) => {
  switch (shipType) {
    case "SSV":
      return 1
    case "DD":
      return 5
    case "CL":
      return 2
    case "CAV":
      return 4
    case "BBV":
      return 7
    case "AO":
      return 12
    case "LHA":
      return 12
    case "AV":
      return 9
    case "AS":
      return 7
    case "CT":
      return 6
  }
  return 0
}

const gearToTp = ({ categoryIs, gearId }: Gear) => {
  if (categoryIs("LandingCraft")) return 8
  if (categoryIs("CombatRation")) return 1

  if (gearId === GearId["ドラム缶(輸送用)"]) return 5
  if (gearId === GearId["特二式内火艇"]) return 2

  return 0
}

export const calcShipTp = (ship: Ship) => {
  const equipmentTp = ship.equipment.sumBy(gearToTp)
  const shipTypeTp = shipTypeToTp(ship.shipType)
  const shipBonus = ship.shipId === ShipId["鬼怒改二"] ? 8 : 0
  return equipmentTp + shipTypeTp + shipBonus
}
