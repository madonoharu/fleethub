import { Factory, Fleet, Gear, Ship } from "@fleethub/sim"
import { EntityId } from "@reduxjs/toolkit"
import { useMemo } from "react"
import { useSelector } from "react-redux"

import { shipsSelectors } from "../store"
import { getEbonuses } from "../utils"

import { useFhSim, selectShipState } from "./useFhSim"

export const useShip = (id: EntityId) => {
  const { createShip } = useFhSim()

  const entity = useSelector((root) => shipsSelectors.selectById(root, id))
  const state = useSelector((root) => selectShipState(root, id))

  const ship = useMemo(() => {
    const ship = state && createShip(state)

    if (ship) {
      const ebonuses = getEbonuses(ship)
      ship.set_ebonuses({
        ...ebonuses,
        anti_air: ebonuses.antiAir,
        speed: 0,
        effective_los: 0,
      })
    }

    return ship
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return {
    ship,
    entity,
  }
}
