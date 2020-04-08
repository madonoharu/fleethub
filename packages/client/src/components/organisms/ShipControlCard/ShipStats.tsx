import React from "react"
import styled from "styled-components"
import { Ship, ShipStat } from "@fleethub/core"

import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import Box from "@material-ui/core/Box"

import { EquipmentControl, ShipBanner, UpdateButton, ClearButton, StatIcon } from "../../../components"
import { ShipEntity } from "../../../store"

import LevelButton from "./LevelButton"
import StatLabel from "./StatLabel"

type Props = {
  ship: Ship
  onUpdate: (changes: Partial<ShipEntity>) => void
}

const keys = ["firepower", "torpedo", "antiAir", "armor", "asw", "los", "evasion"] as const

const Component: React.FCX<Props> = ({ className, ship, onUpdate }) => {
  const handleLevelChange = (level: number) => {
    onUpdate({ level })
  }
  return (
    <Box className={className}>
      <Button>
        <StatLabel statKey="hp" stat={ship.maxHp} />
      </Button>
      {keys.map((key) => (
        <Button key={key}>
          <StatLabel statKey={key} stat={ship[key]} />
        </Button>
      ))}
    </Box>
  )
}

export default styled(Component)`
  display: grid;
  grid-template-columns: 50% 50%;
  button {
    height: 20px;
    padding: 0;
    justify-content: flex-start;
  }
`
