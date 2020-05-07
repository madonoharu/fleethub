import { createEntityAdapter, EntityId, EntitySelectors } from "@reduxjs/toolkit"
import { DefaultRootState } from "react-redux"
import { ShipState, isNonNullable, NullableArray } from "@fleethub/core"

import { Entity, selectId, getUid } from "./entity"
import { GearEntity, gearToEntity, gearsAdapter } from "./gears"
import { Entities } from "."

export type GearIndex = number

export type ShipEntity = Entity &
  Omit<ShipState, "gears"> & {
    gears: NullableArray<EntityId>
  }

export type NormalizedShip = {
  ship: ShipEntity
  gears: GearEntity[]
}

export const normalizeShip = (shipState: ShipState): NormalizedShip => {
  const gears = (shipState.gears ?? []).map((gear) => gear && gearToEntity(gear))
  const gearIds = gears.map((gear) => gear?.uid)

  const ship: ShipEntity = { uid: getUid(), ...shipState, gears: gearIds }

  return { ship, gears: gears.filter(isNonNullable) }
}

export const shipsAdapter = createEntityAdapter<ShipEntity>({ selectId })

export const shipsSelectors: EntitySelectors<ShipEntity, DefaultRootState> = shipsAdapter.getSelectors(
  (state) => state.entities.ships
)

export class ShipModel {
  static from = (state: Entities, id: EntityId) => {
    const entity = state.ships.entities[id]
    return entity && new ShipModel(state, entity)
  }

  private constructor(private state: Entities, private entity: ShipEntity) {}

  public setGear = (index: GearIndex, gear?: EntityId | GearEntity) => {
    if (typeof gear === "object") {
      this.entity.gears[index] = gearsAdapter.selectId(gear)
    } else {
      this.entity.gears[index] = gear
    }
  }

  get gears() {
    return this.entity.gears
  }

  get id() {
    return shipsAdapter.selectId(this.entity)
  }

  public removeAllGears = () => {
    const { state, gears } = this
    gears.forEach((gear) => {
      gear && gearsAdapter.removeOne(state.gears, gear)
    })
  }

  public remove = () => {
    const { state, id } = this
    this.removeAllGears()
    shipsAdapter.removeOne(state.ships, id)
    Object.values(state.fleets.entities).forEach((fleet) => {
      if (!fleet) return
      const removeShip = (ships: NullableArray<EntityId>) => {
        const index = ships.indexOf(id)
        if (index >= 0) ships[index] = undefined
      }
      removeShip(fleet.ships)
    })
  }
}
