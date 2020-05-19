import React from "react"
import { GearState, ShipState, FleetState, AirbaseState, PlanState } from "@fleethub/core"
import { createCachedSelector, LruMapCache } from "re-reselect"
import { createSelector } from "reselect"

import { useFhSystem } from "./useFhSystem"

const keySelector = <S>(state: S) => state

export const useCachedFhFactory = () => {
  const system = useFhSystem()

  return React.useMemo(() => {
    const airbaseCacheSize = 3
    const fleetCacheSize = 4
    const shipCacheSize = fleetCacheSize * 7
    const gearCacheSize = shipCacheSize * 6 + airbaseCacheSize * 4

    const createGear = createCachedSelector(
      (state: GearState) => state,
      system.createGear
    )({
      keySelector,
      cacheObject: new LruMapCache({ cacheSize: gearCacheSize }),
    })

    const createShip = createCachedSelector(
      (state: ShipState) => state,
      (state) => system.createShip(state, createGear)
    )({
      keySelector,
      cacheObject: new LruMapCache({ cacheSize: shipCacheSize }),
    })

    const createFleet = createCachedSelector(
      (state: FleetState) => state,
      (state) => system.createFleet(state, createShip)
    )({
      keySelector,
      cacheObject: new LruMapCache({ cacheSize: fleetCacheSize }),
    })

    const createAirbase = createCachedSelector(
      (state: AirbaseState) => state,
      (state) => system.createAirbase(state, createGear)
    )({
      keySelector,
      cacheObject: new LruMapCache({ cacheSize: airbaseCacheSize }),
    })

    const createPlan = createSelector(
      (state: PlanState) => state,
      (state) => system.createPlan(state, createFleet, createAirbase)
    )

    return { createGear, createShip, createFleet, createAirbase, createPlan }
  }, [system])
}
