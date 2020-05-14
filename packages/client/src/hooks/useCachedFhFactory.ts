import React from "react"
import { GearState, ShipState, FleetState } from "@fleethub/core"
import { createCachedSelector, LruMapCache } from "re-reselect"

import { useFhSystem } from "./useFhSystem"

export const useCachedFhFactory = () => {
  const system = useFhSystem()

  return React.useMemo(() => {
    const fleetCacheSize = 4
    const shipCacheSize = fleetCacheSize * 7
    const gearCacheSize = shipCacheSize * 6

    const createGear = createCachedSelector(
      (state: GearState) => state,
      system.createGear
    )({
      keySelector: (state) => state,
      cacheObject: new LruMapCache({ cacheSize: gearCacheSize }),
    })

    const createShip = createCachedSelector(
      (state: ShipState) => state,
      (state) => system.createShip(state, createGear)
    )({
      keySelector: (state) => state,
      cacheObject: new LruMapCache({ cacheSize: shipCacheSize }),
    })

    const createFleet = createCachedSelector(
      (state: FleetState) => state,
      (state) => system.createFleet(state, createShip)
    )({
      keySelector: (state) => state,
      cacheObject: new LruMapCache({ cacheSize: fleetCacheSize }),
    })

    return { createGear, createShip, createFleet }
  }, [system])
}
