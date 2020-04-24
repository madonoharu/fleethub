import { NightSpecialAttackType } from "./NightSpecialAttackType"
import { ShipId, GearId } from "@fleethub/data"
import { Ship } from "../../ship"

type NightSpecialAttackDefinition = {
  priority: number
  baseRate: number
  power: number
  accuracy: number
}

export type NightSpecialAttackDefinitions = Record<NightSpecialAttackType, NightSpecialAttackDefinition>

const isNightCarrier = (ship: Ship) => {
  if (!ship.is("AircraftCarrierClass")) return false

  // Saratoga Mk.II | 赤城改二戊 | 夜間作戦航空要員
  const hasNoap =
    [ShipId["Saratoga Mk.II"], ShipId["赤城改二戊"]].includes(ship.shipId) ||
    ship.equipment.has((gear) =>
      [GearId["夜間作戦航空要員"], GearId["夜間作戦航空要員+熟練甲板員"]].includes(gear.gearId)
    )

  if (!hasNoap) return false

  return ship.equipment.hasAircraft((gear) => gear.in("NightAttacker", "NightFighter"))
}

class NightSpecialAttackCreator {
  constructor(private definitions: NightSpecialAttackDefinitions) {}

  public createAttacks = (types: NightSpecialAttackType[]) => types.map((type) => ({ type, ...this.definitions[type] }))
}
