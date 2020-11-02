import { GearData, ShipData } from "@fleethub/data"

import { FleetKeys, AirbaseKeys, ShipKey } from "./common"

import { MasterGear, GearState, Gear, makeCreateGear } from "./gear"
import { MasterShip, ShipState, createShip } from "./ship"
import { EquipmentImpl, EquipmentState, EquipmentItem, getGearKeys } from "./equipment"
import { FleetState, FleetImpl } from "./fleet"
import { AirbaseState, AirbaseImpl } from "./airbase"
import { PlanState, PlanImpl, Organization } from "./plan"

import masterData from "@fleethub/utils/MasterData"
import MasterDataAdapter from "./MasterDataAdapter"

const masterDataAdapter = new MasterDataAdapter(masterData)

const createEquipment = (
  state: EquipmentState,
  maxSlots: number[],
  createGear: (state: GearState) => Gear | undefined,
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
    this.masterGears = masterDataAdapter.gears
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

    return new AirbaseImpl(state, equipment)
  }

  public createPlan = (state: PlanState, createFleet = this.createFleet, createAirbase = this.createAirbase) => {
    const org: Partial<Organization> = {}

    FleetKeys.forEach((key) => {
      org[key] = createFleet(state[key] || {})
    })

    AirbaseKeys.forEach((key) => {
      org[key] = createAirbase(state[key] || {})
    })

    return new PlanImpl(state, org as Organization)
  }
}
