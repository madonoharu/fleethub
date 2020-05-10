import React from "react"
import { ShipBase, ShipType, ShipState } from "@fleethub/core"
import constate from "constate"
import { useFhSystem } from "./useFhSystem"

export type ShipSelectState = {
  abyssal: boolean
  commonly: boolean
  shipTypeFilter: string
  onSelect?: (ship: ShipState) => void
}

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

const sortIdComparer = (a: ShipBase, b: ShipBase) => a.sortId - b.sortId

const initalState: ShipSelectState = {
  abyssal: false,
  commonly: true,
  shipTypeFilter: "戦艦級",
}

const useShipSelectState = () => {
  const { masterShips } = useFhSystem()
  const [state, setState] = React.useState<ShipSelectState>(initalState)

  const actions = React.useMemo(() => {
    const update = (changes: Partial<ShipSelectState>) => setState((state) => ({ ...state, ...changes }))

    const close = () => update({ onSelect: undefined })

    const open = (create: (ship: ShipState) => void) => {
      const onSelect: ShipSelectState["onSelect"] = (ship) => {
        create(ship)
        close()
      }
      update({ onSelect })
    }

    return { update, open, close }
  }, [setState])

  const visibleShips = React.useMemo(() => {
    const filterFn = createFilterFn(state)
    return masterShips.filter(filterFn).sort(sortIdComparer)
  }, [state, masterShips])

  return { state, setState, actions, visibleShips }
}

export const [ShipSelectProvider, useShipSelectContext, useShipSelectActions] = constate(
  useShipSelectState,
  (context) => context,
  ({ actions }) => actions
)
