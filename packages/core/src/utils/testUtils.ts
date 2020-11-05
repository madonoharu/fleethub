import { GearData, GearName, gears, ShipName, ShipData, ships } from "@fleethub/data"
import { fhSystem } from ".."
import { MasterShip } from "../MasterDataAdapter"

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

export type ShipDef = Partial<MasterShip> | ShipName

export const shipNameToId = (shipName: ShipName) => {
  const found = fhSystem.factory.masterShips.find((master) => master.name === shipName)
  if (!found) {
    throw `${shipName} not found`
  }

  return found.shipId
}

export type GearDef = GearName | { name: GearName; stars?: number; exp?: number }

const gearDefToState = (def: GearDef) => {
  let name: string
  let stars: number | undefined
  let exp: number | undefined

  if (typeof def === "string") {
    name = def
  } else {
    name = def.name
    stars = def.stars
    exp = def.exp
  }

  const gearId = fhSystem.factory.masterGears.find((master) => master.name === name)?.gearId
  if (!gearId) {
    throw `${name} not found`
  }

  return { gearId, stars, exp }
}

export const makeGear = (def: GearDef) => {
  const state = gearDefToState(def)
  const gear = fhSystem.createGear(state)
  if (!gear) throw `${typeof def === "string" ? def : def.name} not found`
  return gear
}

export const getMasterShip = (name: ShipName) => {
  const found = fhSystem.factory.masterShips.find((ship) => ship.name === name)
  if (!found) {
    throw `${name} not found`
  }
  return found
}

export const makeShip = (shipName: ShipName, ...gearDefs: GearDef[]) => {
  const shipId = shipNameToId(shipName)
  const [g1, g2, g3, g4, g5] = gearDefs.map(gearDefToState)
  const ship = fhSystem.createShip({ shipId, g1, g2, g3, g4, g5 })

  if (!ship) {
    throw `${shipName} failed`
  }

  return ship
}
