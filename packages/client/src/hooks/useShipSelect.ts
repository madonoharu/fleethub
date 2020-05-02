import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { ShipBase, ShipType } from "@fleethub/core"

import { shipSelectSlice, entitiesSlice, ShipSelectState } from "../store"

type FilterFn = (ship: ShipBase) => boolean

type ShipTypeFilterRecord = Record<string, FilterFn | undefined>

const shipTypeFilterRecord: ShipTypeFilterRecord = {
  戦艦級: (ship) => ship.is("BattleshipClass"),
  航空母艦: (ship) => ship.is("AircraftCarrierClass"),
  重巡級: (ship) => ship.is("HeavyCruiserClass"),
  軽巡級: (ship) => ship.is("LightCruiserClass"),
  駆逐艦: (ship) => ship.shipType === ShipType.DD,
  海防艦: (ship) => ship.shipType === ShipType.DE,
  潜水艦: (ship) => ship.is("SubmarineClass"),
  補助艦艇: (ship) =>
    [ShipType.AP, ShipType.AV, ShipType.LHA, ShipType.AR, ShipType.AS, ShipType.AO].includes(ship.shipType),
}

export const shipTypeFilterKeys = Object.keys(shipTypeFilterRecord)

const createFilterFn = (state: ShipSelectState): FilterFn => {
  const fns: FilterFn[] = []
  if (state.abyssal) {
    fns.push((ship) => ship.is("Abyssal"))
  } else {
    fns.push((ship) => !ship.is("Abyssal"))
  }

  if (state.shipTypeFilter) {
    const fn = shipTypeFilterRecord[state.shipTypeFilter]
    if (fn) fns.push(fn)
  }

  if (state.commonly) {
    fns.push((ship) => ship.isCommonly)
  }

  return (ship) => fns.every((fn) => fn(ship))
}

export const useShipSelect = () => {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.shipSelect)

  return React.useMemo(() => {
    const setState = (state: Partial<ShipSelectState>) => {
      dispatch(shipSelectSlice.actions.set(state))
    }

    const open = Boolean(state.target)

    const onClose = () => {
      setState({ target: undefined })
    }

    const onSelect = (shipId: number) => {
      if (!state.target) return
      dispatch(entitiesSlice.actions.createShip({ ...state.target, ship: { shipId } }))
      onClose()
    }

    return {
      state,
      open,
      setState,
      onClose,
      onSelect,
      filterFn: createFilterFn(state),
    }
  }, [dispatch, state])
}
