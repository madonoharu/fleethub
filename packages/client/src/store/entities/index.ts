import { createSlice, PayloadAction, EntityId, Update } from "@reduxjs/toolkit"
import { normalizeShip, shipsAdapter, shipsSelectors, NormalizedShip, ShipModel } from "./ship"
import { gearToEntity, gearsAdapter, gearsSelectors, GearEntity } from "./gear"
import { normalizeFleet, fleetsAdapter, fleetsSelectors, NormalizedFleet } from "./fleet"

export type GearIndex = number

export type GearPosition = {
  ship: EntityId
  index: GearIndex
}

export type ShipPosition = {
  fleet: EntityId
  role: FleetRole
  index: number
}

export const getInitialState = () => ({
  gears: gearsAdapter.getInitialState(),
  ships: shipsAdapter.getInitialState(),
  fleets: fleetsAdapter.getInitialState(),
})

export type Entities = ReturnType<typeof getInitialState>

export type GearState = import("./gear").GearState
export type ShipState = import("./ship").ShipState
export type FleetState = import("./fleet").FleetState
export type FleetRole = import("./fleet").FleetRole

export { gearsSelectors, shipsSelectors, fleetsSelectors }

const slice = createSlice({
  name: "entities",
  initialState: getInitialState(),
  reducers: {
    createGear: {
      reducer: (state, { payload }: PayloadAction<{ ship: EntityId; index: number; gear: GearEntity }>) => {
        gearsAdapter.addOne(state.gears, payload.gear)

        if (payload.ship) {
          ShipModel.from(state, payload.ship)?.setGear(payload.index, payload.gear)
        }
      },
      prepare: (props: { ship: EntityId; index: number; gear: GearState }) => {
        const gear = gearToEntity(props.gear)
        return { payload: { ...props, gear } }
      },
    },

    updateGear: (state, { payload }: PayloadAction<Update<GearState>>) => {
      gearsAdapter.updateOne(state.gears, payload)
    },

    removeGear: (state, { payload }: PayloadAction<EntityId>) => {
      gearsAdapter.removeOne(state.gears, payload)

      Object.values(state.ships.entities).forEach((ship) => {
        if (!ship) return
        const index = ship.gears.indexOf(payload)
        if (index >= 0) delete ship.gears[index]
      })
    },

    swapGear: (state, { payload }: PayloadAction<{ drag: GearPosition; drop: GearPosition }>) => {
      const { drag, drop } = payload

      const dragShip = ShipModel.from(state, drag.ship)
      const dropShip = ShipModel.from(state, drop.ship)

      const dragGear = dragShip?.gears[drag.index]
      const dropGear = dropShip?.gears[drop.index]

      dragShip?.setGear(drag.index, dropGear)
      dropShip?.setGear(drop.index, dragGear)
    },

    createShip: {
      reducer: (state, { payload }: PayloadAction<NormalizedShip & ShipPosition>) => {
        gearsAdapter.addMany(state.gears, payload.gears)
        shipsAdapter.addOne(state.ships, payload.ship)

        const fleet = state.fleets.entities[payload.fleet]
        if (fleet) fleet[payload.role][payload.index] = payload.ship.uid
      },
      prepare: (props: { ship: ShipState } & ShipPosition) => ({
        payload: { ...props, ...normalizeShip(props.ship) },
      }),
    },

    removeShip: (state, { payload }: PayloadAction<EntityId>) => {
      ShipModel.from(state, payload)?.remove()
    },

    createFleet: {
      reducer: (state, { payload }: PayloadAction<NormalizedFleet>) => {
        fleetsAdapter.addOne(state.fleets, payload.fleet)
        gearsAdapter.addMany(state.gears, payload.gears)
        shipsAdapter.addMany(state.ships, payload.ships)
      },
      prepare: (fleetState: FleetState) => {
        return { payload: normalizeFleet(fleetState) }
      },
    },

    removeFleet: (state, { payload }: PayloadAction<EntityId>) => {
      const fleet = state.fleets.entities[payload]
      if (!fleet) return
      const { main, escort } = fleet
      main.concat(escort).forEach((ship) => {
        ship && ShipModel.from(state, ship)?.remove()
      })
      fleetsAdapter.removeOne(state.fleets, payload)
    },
  },
})

type EntitiesSlice = typeof slice
const entitiesSlice: EntitiesSlice = slice
export default entitiesSlice
