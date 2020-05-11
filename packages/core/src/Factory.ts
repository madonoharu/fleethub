import { GearData, ShipData } from "@fleethub/data"

import { MasterGear, GearState, GearImpl } from "./gear"
import { MasterShip, ShipState, createShip } from "./ship"
import { EquipmentImpl } from "./equipment"
import { NullableArray } from "./utils"
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

  private createEquipment = (gearStates: NullableArray<GearState>, defaultSlots: number[], currentSlots?: number[]) => {
    const gears = gearStates.map((state) => state && this.createGear(state))
    return new EquipmentImpl(gears, defaultSlots, currentSlots)
  }

  public createShip = (state: ShipState) => {
    const { shipId } = state
    const base = this.findMasterShip(shipId)
    if (!base) return

    const equipment = this.createEquipment(state.gears ?? [], base.slots, state.slots)

    return createShip(state, base, equipment)
  }

  public createFleet = (state: FleetState) => {
    const ships = state.ships.map((shipState) => shipState && this.createShip(shipState))

    return new FleetImpl(state, ships)
  }

  public createAirbase = (state: AirbaseState) => {
    return new AirbaseImpl(this.createEquipment(state.gears, state.slots, state.slots))
  }
}
