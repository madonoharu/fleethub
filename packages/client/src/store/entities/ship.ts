import { createEntityAdapter, EntityId, EntitySelectors } from "@reduxjs/toolkit"
import { GearState, GearEntity, gearToEntity, gearsAdapter } from "./gear"
import { Entities } from "."
import { getUid, isNonNullable, NullableArray } from "../../utils"
import { fleetsAdapter } from "./fleet"

export type GearIndex = number

export type ShipState = {
  shipId: number
  gears?: NullableArray<GearState>
}

export type ShipEntity = {
  uid: EntityId
  shipId: number
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

export const shipsAdapter = createEntityAdapter<ShipEntity>({
  selectId: (gear) => gear.uid,
})

export const shipsSelectors: EntitySelectors<ShipEntity> = shipsAdapter.getSelectors((state) => state.entities.ships)

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
    Object.values(state.fleets).forEach((fleet) => {
      if (!fleet) return
      const removeShip = (ships: NullableArray<EntityId>) => {
        const index = ships.indexOf(id)
        if (index >= 0) ships[index] = undefined
      }
      removeShip(fleet.main)
      removeShip(fleet.escort)
    })
  }
}
