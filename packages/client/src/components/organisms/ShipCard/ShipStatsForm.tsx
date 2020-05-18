import React from "react"
import styled from "styled-components"
import { Ship, ShipState } from "@fleethub/core"

import { Button, Typography } from "@material-ui/core"

import { NumberInput, Flexbox } from "../../../components"
import { Update } from "../../../utils"

type Props = {
  ship: Ship
  onUpdate: Update<ShipState>
}

const ShipStatsForm: React.FCX<Props> = ({ className, ship, onUpdate }) => {
  return (
    <div className={className}>
      <Typography>{ship.maxHp.increase}</Typography>
      <Typography>{ship.luck.increase}</Typography>
      <Typography>{ship.asw.increase}</Typography>
    </div>
  )
}

export default ShipStatsForm
