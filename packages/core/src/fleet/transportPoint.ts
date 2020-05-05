import { ShipType, GearCategory, GearId, ShipId } from "@fleethub/data"
import { Gear } from "../gear"
import { Ship } from "../ship"

export const shipTypeToTp = (shipType: ShipType) => {
  switch (shipType) {
    case ShipType.SSV:
      return 1
    case ShipType.DD:
      return 5
    case ShipType.CL:
      return 2
    case ShipType.CAV:
      return 4
    case ShipType.BBV:
      return 7
    case ShipType.AO:
      return 12
    case ShipType.LHA:
      return 12
    case ShipType.AV:
      return 9
    case ShipType.AS:
      return 7
    case ShipType.CT:
      return 6
  }
  return 0
}

const gearToTp = ({ category, gearId }: Gear) => {
  if (category === GearCategory.LandingCraft) return 8
  if (category === GearCategory.CombatRation) return 1

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
