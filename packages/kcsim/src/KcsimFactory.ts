import { GearData, ShipData } from "@fleethub/data"
import { range } from "lodash-es"

import { MasterGear, GearState, GearImpl } from "./gear"
import { MasterShip, EquipmentState, ShipState, createShip } from "./ship"
import { EquipmentImpl } from "./equipment"
import { NullableArray } from "./utils"

export type KcsimRawData = {
  gears: GearData[]
  ships: ShipData[]
}

export default class KcsimFactory {
  public masterGears: MasterGear[]
  public masterShips: MasterShip[]

  constructor(data: KcsimRawData) {
    this.masterGears = data.gears.map((raw) => new MasterGear(raw))
    this.masterShips = data.ships.map((raw) => new MasterShip(raw))
  }

  public findMasterGear = (id: number) => this.masterGears.find((gear) => gear.id === id)

  public findMasterShip = (id: number) => this.masterShips.find((ship) => ship.id === id)

  public createGear = (state: GearState) => {
    const base = this.findMasterGear(state.gearId)
    if (!base) return
    return new GearImpl(state, base)
  }

  private createEquipment = (gearStates: NullableArray<GearState>, initialSlots: number[], currentSlots?: number[]) => {
    const size = initialSlots.length

    const gears = range(size).map((index) => {
      const gearState = gearStates?.[index]
      return gearState && this.createGear(gearState)
    })

    return new EquipmentImpl(gears, initialSlots, currentSlots)
  }

  public createShip = (state: ShipState) => {
    const { shipId } = state
    const base = this.findMasterShip(shipId)
    if (!base) return

    const equipment = this.createEquipment(state.gears ?? [], base.slots, state.slots)

    return createShip(state, base, equipment)
  }
}
