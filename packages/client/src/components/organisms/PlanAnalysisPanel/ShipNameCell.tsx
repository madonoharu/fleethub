import React from "react"
import styled from "@emotion/styled"
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
      <ShipBanner publicId={ship.banner} />
    </div>
  )
}

export default ShipNameCell
