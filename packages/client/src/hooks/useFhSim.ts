import { Factory, Fleet, Gear, Ship } from "@fleethub/sim"
import { EntityId } from "@reduxjs/toolkit"
import { createContext, useContext, useCallback, useMemo } from "react"
import { DefaultRootState, shallowEqual, useSelector } from "react-redux"
import { createSelector } from "reselect"
import { createCachedSelector, createStructuredCachedSelector } from "re-reselect"
import { Dict, mapValues, MasterData } from "@fleethub/utils"

import { GearKey, gearsSelectors, GearState, GEAR_KEYS, Role, ShipEntity, shipsSelectors } from "../store"
import { createShallowEqualSelector } from "../utils"

import { selectFleet, ShipKey } from "../store/fleetsSlice"

export type FhCoreState = {
  master_data: MasterData
  factory: Factory
}

export const FhCoreContext = createContext<FhCoreState | null>(null)

const createGearStateSelector = (id: EntityId) =>
  createSelector(
    (root: DefaultRootState) => gearsSelectors.selectById(root, id),
    (entity) => entity
  )

const selectGearState = createCachedSelector(
  gearsSelectors.selectById,
  (entity) => entity
)({ keySelector: (_, id) => id })

createStructuredCachedSelector({
  g1: gearsSelectors.selectById,
  g2: gearsSelectors.selectById,
})({
  keySelector: (_, id) => id,
})

type ShipState = Omit<ShipEntity, GearKey> & Partial<Record<GearKey, GearState>>
type ShipArrayState = Dict<ShipKey, ShipState>

type FleetState = {
  main: ShipArrayState
  escort: ShipArrayState
  route_sup: ShipArrayState
  boss_sup: ShipArrayState
}

export const selectShipState = createCachedSelector(
  (root: DefaultRootState, id: EntityId): ShipState | undefined => {
    const shipEntity = shipsSelectors.selectById(root, id)
    if (!shipEntity) return undefined

    const state = { ...shipEntity } as ShipState

    GEAR_KEYS.forEach((key) => {
      const id = shipEntity[key]
      if (id) {
        state[key] = gearsSelectors.selectById(root, id)
      } else {
        delete state[key]
      }
    })

    return state
  },
  (state) => state
)({
  keySelector: (state, id) => id,
  selectorCreator: createShallowEqualSelector,
})

export const useFhSim = () => {
  const contextValue = useContext(FhCoreContext)

  if (!contextValue) {
    throw new Error("could not find context value")
  }

  const { factory, master_data } = contextValue

  const createGear = (state: GearState): Gear | undefined => {
    return factory.create_gear(state)
  }

  const createShip = (state: ShipState): Ship | undefined => {
    return factory.create_ship(state)
  }

  const createFleet = (state: FleetState): Fleet | undefined => {
    return factory.create_fleet(state)
  }

  const findShipClassName = (ctype: number) => master_data.ship_classes.find((sc) => sc.id === ctype)?.name || ""

  return {
    master_data,
    factory,
    createGear,
    createShip,
    createFleet,
    findShipClassName,
  }
}

export const useGear = (id?: EntityId) => {
  const { createGear } = useFhSim()

  const entity = useSelector((root) => {
    return id ? gearsSelectors.selectById(root, id) : undefined
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gear = useMemo(() => entity && createGear(entity), [entity])

  return {
    gear,
    entity,
  }
}

export const useFleet = (id: EntityId) => {
  const { createFleet } = useFhSim()
  const entity = useSelector((root) => selectFleet(root, id))

  const state = useSelector((root) => {
    if (!entity) return

    const selectShipArrayState = (role: Role) =>
      mapValues(entity[role], (id): ShipState | undefined => (id ? selectShipState(root, id) : undefined))

    return {
      main: selectShipArrayState("main"),
      escort: selectShipArrayState("escort"),
      route_sup: selectShipArrayState("route_sup"),
      boss_sup: selectShipArrayState("boss_sup"),
    }
  })

  const fleet = state && createFleet(state)
  fleet?.free()

  return { entity }
}
