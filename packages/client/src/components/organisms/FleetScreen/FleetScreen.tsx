import React from "react"
import { EntityId, nanoid } from "@reduxjs/toolkit"
import { useDispatch, useSelector } from "react-redux"
import styled from "@emotion/styled"
import { Ship } from "@fleethub/sim"
import { Role, ShipKey } from "@fleethub/utils"

import { shipsSlice } from "../../../store"

import FleetShipList from "./FleetShipList"
import { useFleet } from "../../../hooks"

type FleetScreenProps = {
  id: EntityId
  role: Role
}

const FleetScreen: React.FCX<FleetScreenProps> = ({ className, id, role }) => {
  const { entity } = useFleet(id)
  const dispatch = useDispatch()

  const handleShipChange = (ship: Ship, role: Role, key: ShipKey) => {
    dispatch(shipsSlice.actions.add({ id: nanoid(), ship_id: ship.ship_id }, { id, role, key }))
  }

  if (!entity) {
    return null
  }

  return (
    <div className={className}>
      <h3>{role}</h3>
      <FleetShipList role={role} ships={entity[role]} onShipChange={handleShipChange} />
    </div>
  )
}

export default styled(FleetScreen)``
