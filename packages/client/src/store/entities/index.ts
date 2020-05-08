import { createSlice, PayloadAction, EntityId, createAction } from "@reduxjs/toolkit"
import { GearState, ShipState, FleetState, PlanState, isNonNullable } from "@fleethub/core"

import { shipsAdapter, ShipEntity } from "./ships"
import { gearsAdapter, GearEntity } from "./gears"
import { fleetsAdapter } from "./fleets"
import { plansAdapter } from "./plans"
import {
  setIdToGear,
  normalizePlan,
  normalizeShip,
  NormalizedEntities,
  FhNormalizedSchema,
  normalizeFleet,
} from "./schemas"
import { shipsSelectors, fleetsSelectors, plansSelectors } from "./selectors"
import { airbasesAdapter } from "./airbases"

export type GearIndex = number

export type GearPosition = {
  type: "ship" | "airbase"
  id: EntityId
  index: number
}

export type ShipPosition = {
  fleet: EntityId
  index: number
}

export const getInitialState = () => ({
  gears: gearsAdapter.getInitialState(),
  ships: shipsAdapter.getInitialState(),
  fleets: fleetsAdapter.getInitialState(),
  airbases: airbasesAdapter.getInitialState(),
  plans: plansAdapter.getInitialState(),
})

export type Entities = ReturnType<typeof getInitialState>

export type { ShipEntity }
export type { FleetEntity } from "./fleets"

export type ShipChanges = Partial<ShipEntity>

export { selectId } from "./entity"

export * from "./selectors"

const addReducer = <K extends keyof Entities, A>(key: K, reducer: (state: Entities[K], action: A) => Entities[K]) => (
  state: Entities,
  action: A
) => {
  reducer(state[key], action)
}

const addEntities = (state: Entities, { gears, ships, fleets, plans }: NormalizedEntities) => {
  if (gears) gearsAdapter.addMany(state.gears, gears)
  if (ships) shipsAdapter.addMany(state.ships, ships)
  if (fleets) fleetsAdapter.addMany(state.fleets, fleets)
  if (plans) plansAdapter.addMany(state.plans, plans)
}

const sweepGears = (state: Entities) => {
  const shipGears = Object.values(state.ships.entities)
    .flatMap((ship) => ship?.gears)
    .filter(isNonNullable)

  state.gears.ids.forEach((id) => {
    if (!shipGears.includes(id as string)) {
      gearsAdapter.removeOne(state.gears, id)
    }
  })
}

const createEntityUpdater = <E extends NonNullable<Entities[keyof Entities]["entities"][string]>>(
  getEntity: (state: Entities, id: EntityId) => E | undefined
) => (state: Entities, id: EntityId, cb: (entity: E) => void) => {
  const entity = getEntity(state, id)
  return entity && cb(entity)
}

const updateShipEntity = createEntityUpdater(shipsSelectors.selectById)
const updateFleetEntity = createEntityUpdater(fleetsSelectors.selectById)

const getGearParent = (state: Entities, { type, id }: GearPosition) => {
  if (type === "ship") return state.ships.entities[id]
  return state.airbases.entities[id]
}

const removeShip = (state: Entities, id: EntityId) => {
  shipsSelectors.selectById(state, id)?.gears.forEach((gearId) => gearId && gearsAdapter.removeOne(state.gears, gearId))
  shipsAdapter.removeOne(state.ships, id)
}

const removeFleet = (state: Entities, id: EntityId) => {
  fleetsSelectors.selectById(state, id)?.ships.forEach((shipId) => shipId && removeShip(state, shipId))
  fleetsAdapter.removeOne(state.fleets, id)
}

const removePlan = (state: Entities, id: EntityId) => {
  plansSelectors.selectById(state, id)?.fleets.forEach((fleetId) => removeFleet(state, fleetId))
  plansAdapter.removeOne(state.plans, id)
}

const slice = createSlice({
  name: "entities",
  initialState: getInitialState(),
  reducers: {
    createGear: (state, { payload }: PayloadAction<{ to: GearPosition; gear: GearState }>) => {
      const gear = setIdToGear(payload.gear)
      gearsAdapter.addOne(state.gears, gear)

      const entity = getGearParent(state, payload.to)
      if (entity) entity.gears[payload.to.index] = gear.id
    },

    updateGear: addReducer("gears", gearsAdapter.updateOne),

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

      const dragParent = getGearParent(state, drag)
      const dropParent = getGearParent(state, drop)

      const dragGear = dragParent?.gears[drag.index]
      const dropGear = dropParent?.gears[drop.index]

      if (dragParent) dragParent.gears[drag.index] = dropGear
      if (dropParent) dropParent.gears[drop.index] = dragGear
    },

    createShip: (state, { payload }: PayloadAction<{ to: ShipPosition; ship: ShipState }>) => {
      const schema = normalizeShip(payload.ship)
      addEntities(state, schema.entities)

      updateFleetEntity(state, payload.to.fleet, (fleetEntity) => {
        const prev = fleetEntity.ships[payload.to.index]
        if (prev) removeShip(state, prev)

        fleetEntity.ships[payload.to.index] = schema.result
      })
    },

    updateShip: addReducer("ships", shipsAdapter.updateOne),

    removeShip: (state, { payload }: PayloadAction<EntityId>) => removeShip(state, payload),

    createFleet: (state, { payload }: PayloadAction<FleetState>) => {
      addEntities(state, normalizeFleet(payload).entities)
    },

    updateFleet: addReducer("fleets", fleetsAdapter.updateOne),

    removeFleet: (state, { payload }: PayloadAction<EntityId>) => removeFleet(state, payload),

    createPlan: (state, { payload }: PayloadAction<PlanState>) => {
      addEntities(state, normalizePlan(payload).entities)
    },

    removePlan: (state, { payload }: PayloadAction<EntityId>) => removePlan(state, payload),
  },
})

type EntitiesSlice = typeof slice
const entitiesSlice: EntitiesSlice = slice
export default entitiesSlice
