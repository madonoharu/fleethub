import React from "react"

import { useCallback, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { GearState, GearBase } from "@fleethub/core"

import { gearSelectSlice, entitiesSlice, GearSelectState, GearPosition, shipsSelectors } from "../store"
import { useFhSystem } from "./useFhSystem"

import { getFilter, getVisibleFilterKeys } from "../components/templates/GearSelect/filters"

export type GearFilterFn = (gear: GearBase) => boolean

const createFilterFn = (state: GearSelectState, equippableGears: GearBase[]): GearFilterFn => {
  const visibleFilterKeys = getVisibleFilterKeys(equippableGears)

  const fns: GearFilterFn[] = []

  if (state.abyssal) fns.push((gear) => gear.is("Abyssal"))
  else fns.push((gear) => !gear.is("Abyssal"))

  const gearFilterFn = getFilter(state.filter)
  if (gearFilterFn) fns.push(gearFilterFn)

  return (gear) => fns.every((fn) => fn(gear))
}

const useEquippableFilter = (position?: GearPosition) => {
  const fhSystem = useFhSystem()
  const entity = useSelector((state) => position && shipsSelectors.selectEntities(state)[position.ship])
  const fhShip = React.useMemo(() => {
    return entity && fhSystem.createShip(entity)
  }, [fhSystem, entity])

  return React.useCallback(
    (gear: GearBase) => {
      if (!position || !fhShip) return true
      return fhShip.canEquip(position.index, gear)
    },
    [position, fhShip]
  )
}

export const useGearSelect = () => {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.gearSelect)

  const open = Boolean(state.position)

  const { setState, onClose } = useMemo(() => {
    const setState = (state: Partial<GearSelectState>) => dispatch(gearSelectSlice.actions.set(state))
    const onClose = () => setState({ position: undefined })
    return { setState, onClose }
  }, [dispatch])

  const onSelect = useCallback(
    (gear: GearState) => {
      if (!state.position) return
      dispatch(entitiesSlice.actions.createGear({ ...state.position, gear }))
      onClose()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.position, onClose]
  )

  const equippableFilter = useEquippableFilter(state.position)

  return { state, setState, open, onClose, onSelect, equippableFilter }
}
