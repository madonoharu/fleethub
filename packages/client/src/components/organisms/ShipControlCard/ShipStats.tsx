import React from "react"
import styled from "styled-components"
import { Ship, ShipStat } from "@fleethub/core"

import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import Box from "@material-ui/core/Box"

import { StatIcon } from "../../../components"
import { ShipChanges } from "../../../store"

import ShipStatButton from "./ShipStatButton"

type Props = {
  ship: Ship
  onUpdate: (changes: ShipChanges) => void
}

const keys = ["maxHp", "firepower", "torpedo", "antiAir", "armor", "asw", "los", "evasion"] as const
export type StatKey = typeof keys[number]

const ShipStats: React.FCX<Props> = ({ className, ship, onUpdate }) => {
  return (
    <Box className={className}>
      {keys.map((key) => (
        <ShipStatButton key={key} statKey={key} stat={ship[key]} onUpdate={onUpdate} />
      ))}
    </Box>
  )
}

export default styled(ShipStats)`
  display: grid;
  grid-template-columns: 50% 50%;
  button {
    height: 20px;
    padding: 0;
    justify-content: flex-start;
  }
`
