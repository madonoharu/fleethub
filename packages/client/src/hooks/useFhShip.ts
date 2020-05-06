import React from "react"
import { useSelector } from "react-redux"
import { EntityId } from "@reduxjs/toolkit"

import { makeGetShipState } from "../store"

import { useFhSystem } from "./useFhSystem"

export const useFhShip = (id: EntityId) => {
  const fhSystem = useFhSystem()
  const getShipState = React.useMemo(makeGetShipState, [id])
  const state = useSelector((state) => getShipState(state, id))

  return React.useMemo(() => state && fhSystem.createShip(state), [fhSystem, state])
}
