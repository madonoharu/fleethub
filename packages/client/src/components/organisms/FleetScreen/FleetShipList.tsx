import React from "react"
import { EntityId } from "@reduxjs/toolkit"
import styled from "@emotion/styled"
import { Ship } from "@fleethub/sim"
import { SHIP_KEYS, Dict, ShipKey, Role } from "@fleethub/utils"

import ShipBox from "../ShipBox"

type FleetShipListProps = {
  role: Role
  ships: Dict<ShipKey, EntityId>
  size?: number
  onShipChange?: (ship: Ship, role: Role, key: ShipKey) => void
}

const FleetShipList: React.FCX<FleetShipListProps> = ({ className, role, ships, size = 6, onShipChange }) => {
  return (
    <div className={className}>
      {SHIP_KEYS.filter((_, index) => index + 1 <= size).map((key) => (
        <ShipBox key={key} id={ships[key]} onShipChange={(ship) => onShipChange?.(ship, role, key)} />
      ))}
    </div>
  )
}

export default styled(FleetShipList)`
  margin: 8px;
  width: 1000px;

  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
`
