import { GearData, ShipData } from "@fleethub/data"

import { MasterGear, GearState, GearImpl } from "./gear"
import { MasterShip, ShipState, createShip } from "./ship"
import { EquipmentImpl, EquipmentState, EquipmentItem, getGearKeys } from "./equipment"
import { FleetState, FleetImpl, Fleet } from "./fleet"
import { AirbaseState, AirbaseImpl, Airbase } from "./airbase"
import { PlanState, PlanImpl, FleetKey, AirbaseKey } from "./plan"
import { isNonNullable } from "./utils"

const createEquipment = (
  state: EquipmentState,
  maxSlots: number[],
  createGear: (state: GearState) => GearImpl | undefined
) => {
  const items: EquipmentItem[] = getGearKeys(maxSlots.length).map(([key, slotKey], index) => {
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

  public createGear = (state: GearState) => {
    const base = this.findMasterGear(state.gearId)
    if (!base) return

    const improvement = base.toImprovementBonuses(state.stars || 0)
    return new GearImpl(state, base, improvement)
  }

  public createShip = (state: ShipState, createGear = this.createGear) => {
    const { shipId } = state
    const base = this.findMasterShip(shipId)
    if (!base) return

    const equipment = createEquipment(state, base.slots, createGear)

    return createShip(state, base, equipment)
  }

  public createFleet = (state: FleetState, createShip = this.createShip) => {
    const shipKeys = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const
    const entries: FleetImpl["entries"] = shipKeys.map((key) => {
      const shipState = state[key]
      const ship = shipState && createShip(shipState)
      return [key, ship]
    })

    return new FleetImpl(state, entries)
  }

  public createAirbase = (state: AirbaseState, createGear = this.createGear) => {
    const equipment = createEquipment(state, [18, 18, 18, 18], createGear)

    return new AirbaseImpl(equipment)
  }

  public createPlan = (state: PlanState, createFleet = this.createFleet, createAirbase = this.createAirbase) => {
    const fleetKeys = ["f1", "f2", "f3", "f4"] as const
    const airbaseKeys = ["a1", "a2", "a3"] as const

    const fleetEntries = fleetKeys
      .map((key): [FleetKey, Fleet] | undefined => {
        const fleetState = state[key]
        if (!fleetState) return
        return [key, createFleet(fleetState)]
      })
      .filter(isNonNullable)

    const airbaseEntries = airbaseKeys
      .map((key): [AirbaseKey, Airbase] | undefined => {
        const airbaseState = state[key]
        if (!airbaseState) return
        return [key, createAirbase(airbaseState)]
      })
      .filter(isNonNullable)

    return new PlanImpl(state, fleetEntries, airbaseEntries)
  }
}
