import { GearData, GearName, gears, ShipName, ShipData, ships } from "@fleethub/data"
import { RequiredShipData, toRequiredShipData } from "../ship/MasterShip"

export const getGearData = (name: GearName): GearData => {
  const found = gears.find(data => data.name === name)

  if (!found) {
    throw `${name} not found`
  }

  return found
}

export const getShipData = (name: ShipName): ShipData => {
  const found = ships.find(data => data.name === name)

  if (!found) {
    throw `${name} not found`
  }

  return found
}

export type ShipDef = Partial<RequiredShipData> | ShipName

export const defToData = (def: ShipDef): RequiredShipData => {
  if (typeof def === "string") {
    return toRequiredShipData(getShipData(def))
  }
  return toRequiredShipData(def)
}
