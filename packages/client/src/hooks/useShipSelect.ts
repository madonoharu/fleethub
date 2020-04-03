import React from "react"
import { navigate } from "gatsby"
import { useSelector, useDispatch } from "react-redux"

import { shipSelectSlice, entitiesSlice, ShipSelectState } from "../store"

export const useShipSelect = () => {
  const dispatch = useDispatch()
  const state = useSelector((state) => state.shipSelect)

  return React.useMemo(() => {
    const setState = (state: ShipSelectState) => {
      dispatch(shipSelectSlice.actions.set(state))
    }

    const open = Boolean(state.position)

    const onOpen = (state: ShipSelectState) => setState(state)

    const onClose = () => {
      setState({ position: undefined })
    }

    const onSelect = (shipId: number) => {
      if (!state.position) return

      dispatch(entitiesSlice.actions.createShip({ ...state.position, ship: { shipId } }))
      onClose()
    }

    return { state, onOpen, open, onClose, onSelect }
  }, [dispatch, state])
}
