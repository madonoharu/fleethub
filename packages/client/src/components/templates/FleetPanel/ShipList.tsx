import React from "react"
import { EntityId } from "@reduxjs/toolkit"
import styled from "styled-components"

import AddIcon from "@material-ui/icons/Add"
import DeleteIcon from "@material-ui/icons/Delete"

import { ShipControlCard, RemoveButton } from "../../../components"
import { NullableArray } from "../../../utils"
import { ShipPosition, FleetRole } from "../../../store"

type Props = {
  ships: NullableArray<EntityId>
  onAdd: (role: FleetRole, index: number) => void
} & Omit<ShipPosition, "index">

const ShipList: React.FCX<Props> = React.memo(({ className, fleet, role, ships, onAdd }) => {
  return (
    <div className={className}>
      {ships.map((ship, index) => (
        <ShipControlCard key={`${fleet}-${role}-${index}`} ship={ship} onAdd={() => onAdd(role, index)} />
      ))}
    </div>
  )
})

export default styled(ShipList)`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
`
