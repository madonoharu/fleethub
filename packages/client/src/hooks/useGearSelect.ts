import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { GearState, GearBase, EquipmentBonuses } from "@fleethub/core"

import { gearSelectSlice, entitiesSlice, GearSelectState } from "../store"
import { useFhShip } from "./useFhShip"

type Key = keyof EquipmentBonuses
export const subtract = (left: EquipmentBonuses, right: EquipmentBonuses) => {
  const diff: EquipmentBonuses = { ...left }

  for (const key in left) {
    diff[key as Key] = (left[key as Key] || 0) - (right[key as Key] || 0)
  }

  return diff
}

export type GearFilterFn = (gear: GearBase) => boolean

export const useGearSelect = () => {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.gearSelect)
  const { target } = state

  const actions = React.useMemo(() => {
    const setState = (state: Partial<GearSelectState>) => dispatch(gearSelectSlice.actions.set(state))

    const onClose = () => setState({ target: undefined })

    const onSelect = (gear: GearState) => {
      if (!target) return
      dispatch(entitiesSlice.actions.createGear({ to: target, gear }))
      onClose()
    }

    return { setState, onClose, onSelect }
  }, [dispatch, target])

  const fhShip = useFhShip(target?.id)
  const shipFns = React.useMemo(() => {
    if (!target || !fhShip) return {}

    const equippableFilter = (gear: GearBase) => fhShip.canEquip(target.index, gear)
    const getBonuses = fhShip.createNextBonusesGetter(target.index)

    return { equippableFilter, getBonuses }
  }, [fhShip, target])

  return { state, open: Boolean(state.target), ...actions, ...shipFns }
}
