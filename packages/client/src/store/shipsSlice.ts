import { GearKey, ShipKey, Role } from "@fleethub/utils"
import { createSlice, createEntityAdapter, EntitySelectors, EntityId } from "@reduxjs/toolkit"
import { DefaultRootState } from "react-redux"

import { selectShipsState } from "./selectors"
import { gearsSlice } from "./gearsSlice"

export type ShipEntity = {
  id: EntityId
  ship_id: number
} & Partial<Record<GearKey, string>>

export type ShipPosition = { id: EntityId; role: Role; key: ShipKey }

const adapter = createEntityAdapter<ShipEntity>()
export const shipsSelectors: EntitySelectors<ShipEntity, DefaultRootState> = adapter.getSelectors(selectShipsState)

export const shipsSlice = createSlice({
  name: "ships",
  initialState: adapter.getInitialState(),
  reducers: {
    add: {
      reducer: adapter.addOne,
      prepare: (state: ShipEntity, to: ShipPosition) => ({
        payload: state,
        meta: { fleet: to },
      }),
    },
    remove: adapter.removeOne,
  },
  extraReducers: (builder) => {
    builder.addCase(gearsSlice.actions.add, (state, { payload, meta }) => {
      const position = meta.ship
      const entity = position && state.entities[position.id]
      if (!position || !entity) return

      entity[position.key] = payload.id
    })
  },
})
