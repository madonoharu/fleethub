import React from "react"
import styled from "styled-components"
import { Ship } from "@fleethub/core"

import { Typography } from "@material-ui/core"

import { ShipBanner } from "../../../components"

type Props = {
  ship: Ship
}

const ShipNameCell: React.FCX<Props> = ({ className, ship }) => {
  return (
    <div className={className}>
      <Typography variant="caption" display="block">
        {ship.name}
      </Typography>
      <ShipBanner shipId={ship.shipId} />
    </div>
  )
}

export default ShipNameCell
