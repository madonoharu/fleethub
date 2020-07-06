import React from "react"
import styled from "styled-components"
import { FleetState, Fleet } from "@fleethub/core"

import { Update } from "../../../utils"

import ConnectedShipCard from "./ConnectedShipCard"

type Props = {
  fleet: Fleet
  updateFleet: Update<FleetState>
}

const ShipList: React.FCX<Props> = React.memo(({ className, fleet, updateFleet }) => {
  return (
    <div className={className}>
      {fleet.entries.map(([key, ship]) => (
        <ConnectedShipCard key={key} shipKey={key} ship={ship} updateFleet={updateFleet} />
      ))}
    </div>
  )
})

export default styled(ShipList)`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  > * {
    height: ${24 * 7 + 8}px;
  }
`
