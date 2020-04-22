import { GearData, GearName, gears, ShipName, ShipData, ships } from "@fleethub/data"
import { RequiredShipData, toStatBase } from "../ship/MasterShip"
import { fhSystem } from ".."

export const toRequiredShipData = (partial: Partial<ShipData>): RequiredShipData => ({
  id: partial.id ?? 0,

  shipClass: partial.shipClass ?? 0,
  shipType: partial.shipType ?? 0,
  name: partial.name ?? "",
  ruby: partial.ruby ?? "",

  sortNo: partial.sortNo ?? 0,
  sortId: partial.sortId ?? 0,

  hp: toStatBase(partial.hp),
  armor: toStatBase(partial.armor),
  firepower: toStatBase(partial.firepower),
  torpedo: toStatBase(partial.torpedo),
  antiAir: toStatBase(partial.antiAir),
  luck: toStatBase(partial.luck),
  asw: toStatBase(partial.asw),
  evasion: toStatBase(partial.evasion),
  los: toStatBase(partial.los),

  speed: partial.speed ?? 0,
  range: partial.range ?? 0,

  fuel: partial.fuel ?? 0,
  ammo: partial.ammo ?? 0,

  slots: (partial.slots ?? []).concat(),
  gears: (partial.gears ?? []).map((gear) => {
    if (typeof gear === "number") {
      return { gearId: gear }
    }
    return gear
  }),

  nextId: partial.nextId ?? 0,
  nextLevel: partial.nextLevel ?? 0,
  convertible: false,
})

export const getGearData = (name: GearName): GearData => {
  const found = gears.find((data) => data.name === name)

  if (!found) {
    throw `${name} not found`
  }

  return found
}

export const getShipData = (name: ShipName): ShipData => {
  const found = ships.find((data) => data.name === name)

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

const shipNameToId = (shipName: ShipName) => {
  const found = fhSystem.factory.masterShips.find((master) => master.name === shipName)
  if (!found) {
    throw `${shipName} not found`
  }

  return found.shipId
}
type GearDef = GearName | { name: GearName; stars?: number; exp?: number }

const gearNameToState = (name: GearName) => {
  const gearId = fhSystem.factory.masterGears.find((master) => master.name === name)?.gearId
  if (!gearId) {
    throw `${name} not found`
  }

  return { gearId }
}

export const makeShip = (shipName: ShipName, ...gearDefs: GearName[]) => {
  const shipId = shipNameToId(shipName)
  const gears = gearDefs.map(gearNameToState)
  const ship = fhSystem.createShip({ shipId, gears })

  if (!ship) {
    throw `${shipName} failed`
  }

  return ship
}
