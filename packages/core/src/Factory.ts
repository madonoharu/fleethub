import { GearData, ShipData } from "@fleethub/data"

import { MasterGear, GearState, GearImpl } from "./gear"
import { MasterShip, ShipState, createShip } from "./ship"
import { EquipmentImpl, EquipmentState, EquipmentItem, getEquipmentKeys } from "./equipment"
import { FleetState, FleetImpl } from "./fleet"
import { AirbaseState, AirbaseImpl } from "./airbase"

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

  private createEquipment = (state: EquipmentState, maxSlots: number[]) => {
    const stateGears = state.gears || {}
    const stateSlots = state.slots || {}

    const items: EquipmentItem[] = getEquipmentKeys(maxSlots.length).map((key, index) => {
      const gearState = stateGears[key]
      const gear = gearState && this.createGear(gearState)

      if (key === "gx") return { key, gear }

      const maxSlotSize = maxSlots[index]
      const currentSlotSize = stateSlots[key] || maxSlotSize

      return { key, gear, currentSlotSize, maxSlotSize }
    })

    return new EquipmentImpl(items)
  }

  public createShip = (state: ShipState) => {
    const { shipId } = state
    const base = this.findMasterShip(shipId)
    if (!base) return

    const equipment = this.createEquipment(state, base.slots)

    return createShip(state, base, equipment)
  }

  public createFleet = (state: FleetState) => {
    const ships = state.ships.map((shipState) => shipState && this.createShip(shipState))

    return new FleetImpl(state, ships)
  }

  public createAirbase = (state: AirbaseState) => {
    return new AirbaseImpl(this.createEquipment(state, [18, 18, 18, 18]))
  }
}
