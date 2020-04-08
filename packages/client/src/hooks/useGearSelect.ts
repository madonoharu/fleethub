import React from "react"

import { useCallback, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { GearState, kcsim, MasterGear } from "@fleethub/kcsim"

import { gearSelectSlice, entitiesSlice, GearSelectState, GearPosition, shipsSelectors } from "../store"

const useEquippableFilter = (position?: GearPosition) => {
  const shipEntity = useSelector((state) => position && shipsSelectors.selectEntities(state)[position.ship])
  const kcShip = React.useMemo(() => {
    return shipEntity && kcsim.createShip(shipEntity)
  }, [shipEntity])

  return React.useCallback(
    (gear: MasterGear) => {
      if (!position || !kcShip) return true
      return kcShip.canEquip(position.index, gear)
    },
    [position, kcShip]
  )
}

export const useGearSelect = () => {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.gearSelect)

  const open = Boolean(state.position)

  const { setState, onOpen, onClose } = useMemo(() => {
    const setState = (state: Partial<GearSelectState>) => dispatch(gearSelectSlice.actions.set(state))
    const onOpen = setState
    const onClose = () => setState({ position: undefined })
    return { setState, onOpen, onClose }
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

  return { state, setState, open, onOpen, onClose, onSelect, equippableFilter }
}
