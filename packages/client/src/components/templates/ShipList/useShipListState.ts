import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { ShipBase } from "@fleethub/core"

import { useFhSystem } from "../../../hooks"
import { ShipListState, shipListSlice, selectShipListState } from "../../../store"

type FilterFn = (ship: ShipBase) => boolean

const createFilterFn = (state: ShipListState): FilterFn => {
  const fns: FilterFn[] = []
  if (state.abyssal) {
    fns.push((ship) => ship.is("Abyssal"))
  } else {
    fns.push((ship) => !ship.is("Abyssal"))
  }

  fns.push((ship) => ship.category === state.category)

  if (state.commonly) {
    fns.push((ship) => ship.isCommonly)
  }

  return (ship) => fns.every((fn) => fn(ship))
}

const sortIdComparer = (a: ShipBase, b: ShipBase) => a.sortId - b.sortId

export const useShipListState = () => {
  const { masterShips } = useFhSystem()
  const state = useSelector(selectShipListState)
  const dispatch = useDispatch()

  const update = (changes: Partial<ShipListState>) => dispatch(shipListSlice.actions.update(changes))

  const visibleShips = React.useMemo(() => {
    const filterFn = createFilterFn(state)
    return masterShips.filter(filterFn).sort(sortIdComparer)
  }, [state, masterShips])

  return { state, update, visibleShips }
}
