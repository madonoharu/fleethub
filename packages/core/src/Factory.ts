import { GearData, ShipData } from "@fleethub/data"

import { MasterGear, GearState, GearImpl, makeCreateGear } from "./gear"
import { MasterShip, ShipState, createShip } from "./ship"
import { EquipmentImpl, EquipmentState, EquipmentItem, getGearKeys } from "./equipment"
import { FleetState, FleetImpl, Fleet, ShipKey } from "./fleet"
import { AirbaseState, AirbaseImpl, Airbase } from "./airbase"
import { PlanState, PlanImpl, FleetKey, AirbaseKey } from "./plan"

const createEquipment = (
  state: EquipmentState,
  maxSlots: number[],
  createGear: (state: GearState) => GearImpl | undefined,
  exslot = true
) => {
  const items: EquipmentItem[] = getGearKeys(maxSlots.length, exslot).map(([key, slotKey], index) => {
    const gearState = state[key]
    const gear = gearState && createGear(gearState)

    if (key === "gx") return { key, gear }

    const maxSlotSize = maxSlots[index]
    const currentSlotSize = state[slotKey] ?? maxSlotSize

    return { key, gear, currentSlotSize, maxSlotSize }
  })

  return new EquipmentImpl(items)
}

export type FactoryRawData = {
  gears: GearData[]
  ships: ShipData[]
}

export default class Factory {
  public masterGears: MasterGear[]
  public masterShips: MasterShip[]

  constructor(data: FactoryRawData) {
    this.masterGears = data.gears.map((raw) => new MasterGear(raw))
    this.masterShips = data.ships.map((raw) => new MasterShip(raw))
  }

  public findMasterGear = (id: number) => this.masterGears.find((gear) => gear.id === id)

  public findMasterShip = (id: number) => this.masterShips.find((ship) => ship.id === id)

  public createGear = makeCreateGear(this.findMasterGear)

  public createShip = (state: ShipState, createGear = this.createGear) => {
    const { shipId } = state
    const base = this.findMasterShip(shipId)
    if (!base) return

    const equipment = createEquipment(state, base.slots, createGear)

    return createShip(state, base, equipment)
  }

  public createFleet = (state: FleetState, createShip = this.createShip) => {
    const keys: ShipKey[] = ["s1", "s2", "s3", "s4", "s5", "s6"]
    if (state.s7) keys.push("s7")

    const entries: FleetImpl["entries"] = keys.map((key) => {
      const shipState = state[key]
      const ship = shipState && createShip(shipState)
      return [key, ship]
    })

    return new FleetImpl(state, entries)
  }

  public createAirbase = (state: AirbaseState, createGear = this.createGear) => {
    const equipment = createEquipment(state, [18, 18, 18, 18], createGear, false)

    return new AirbaseImpl(equipment)
  }

  public createPlan = (state: PlanState, createFleet = this.createFleet, createAirbase = this.createAirbase) => {
    const fleetKeys = ["f1", "f2", "f3", "f4"] as const
    const airbaseKeys = ["a1", "a2", "a3"] as const

    const fleetEntries: Array<[FleetKey, Fleet]> = fleetKeys.map((key) => [key, createFleet(state[key] || {})])

    const airbaseEntries: Array<[AirbaseKey, Airbase]> = airbaseKeys.map((key) => [
      key,
      createAirbase(state[key] || {}),
    ])

    return new PlanImpl(state, fleetEntries, airbaseEntries)
  }
}
