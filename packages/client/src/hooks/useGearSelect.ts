import React from "react"
import { createSelector } from "@reduxjs/toolkit"
import { useSelector, useDispatch, DefaultRootState } from "react-redux"
import { GearState, GearBase, EquipmentBonuses } from "@fleethub/core"

import { gearSelectSlice, entitiesSlice, GearSelectState } from "../store"
import { createFhShipSelector } from "./useShip"

type Key = keyof EquipmentBonuses
export const subtract = (left: EquipmentBonuses, right: EquipmentBonuses) => {
  const diff: EquipmentBonuses = { ...left }

  for (const key in left) {
    diff[key as Key] = (left[key as Key] || 0) - (right[key as Key] || 0)
  }

  return diff
}

export type GearFilterFn = (gear: GearBase) => boolean

const getGearSelectState = (state: DefaultRootState) => state.gearSelect
const getShipId = (state: DefaultRootState) => getGearSelectState(state).target?.ship
const createFhShipSelectorByTarget = createSelector(getShipId, (id) => id && createFhShipSelector(id))
const selectFhShipByTarget = createSelector(
  createFhShipSelectorByTarget,
  (state) => state,
  (fhShipSelector, state) => fhShipSelector && fhShipSelector(state)
)

export const useGearSelect = () => {
  const dispatch = useDispatch()
  const state = useSelector(getGearSelectState)
  const fhShip = useSelector(selectFhShipByTarget)

  const { target } = state
  const open = Boolean(state.target)

  const actions = React.useMemo(() => {
    const setState = (state: Partial<GearSelectState>) => dispatch(gearSelectSlice.actions.set(state))

    const onClose = () => setState({ target: undefined })

    const onSelect = (gear: GearState) => {
      if (!target) return
      dispatch(entitiesSlice.actions.createGear({ ...target, gear }))
      onClose()
    }

    return { setState, onClose, onSelect }
  }, [dispatch, target])

  const shipFns = React.useMemo(() => {
    if (!target || !fhShip) return {}

    const equippableFilter = (gear: GearBase) => fhShip.canEquip(target.index, gear)
    const getBonuses = (gear: GearBase) => fhShip.getNextBonuses(target.index, gear)

    return { equippableFilter, getBonuses }
  }, [fhShip, target])

  return { state, open, ...actions, ...shipFns }
}
