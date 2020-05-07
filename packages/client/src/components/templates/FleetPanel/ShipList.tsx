import React from "react"
import { EntityId } from "@reduxjs/toolkit"
import styled from "styled-components"
import { NullableArray } from "@fleethub/core"

import { ShipCard } from "../../../components"
import { ShipPosition } from "../../../store"

type Props = {
  ships: NullableArray<EntityId>
  onAdd: (index: number) => void
}

const ShipList: React.FCX<Props> = React.memo(({ className, ships, onAdd }) => {
  return (
    <div className={className}>
      {ships.map((ship, index) => (
        <ShipCard key={`fleet-${index}`} ship={ship} onAdd={() => onAdd(index)} />
      ))}
    </div>
  )
})

export default styled(ShipList)`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
`
