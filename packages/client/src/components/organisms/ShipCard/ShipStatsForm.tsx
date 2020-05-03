import React from "react"
import styled from "styled-components"
import { Ship } from "@fleethub/core"

import { Button, Typography } from "@material-ui/core"

import { NumberInput, Flexbox } from "../../../components"
import { StatKeyDictionary } from "../../../utils"
import { ShipChanges } from "../../../store"

type Props = {
  ship: Ship
  onUpdate: (changes: ShipChanges) => void
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
