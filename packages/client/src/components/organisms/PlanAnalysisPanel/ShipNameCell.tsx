import React from "react"
import styled from "styled-components"
import { Ship } from "@fleethub/core"

import { Button, Typography, FormControlLabel, Checkbox, colors } from "@material-ui/core"

import { ShipBanner } from "../../../components"

type Props = {
  ship: Ship
}

const ShipNameCell: React.FCX<Props> = ({ ship }) => {
  return (
    <div>
      <div>{ship.name}</div>
      <ShipBanner shipId={ship.shipId} />
    </div>
  )
}

export default ShipNameCell
