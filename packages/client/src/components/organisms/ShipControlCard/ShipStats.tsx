import React from "react"
import styled from "styled-components"
import { Ship, ShipStatKey, ShipStat } from "@fleethub/core"

import { Text } from "../../../components"
import { ShipChanges } from "../../../store"

import ShipStatButton from "./ShipStatButton"
import ShipStatLabel from "./ShipStatLabel"

type ShipStatItemProps = {
  index: number
  stat: ShipStat
  onUpdate: (changes: ShipChanges) => void
}

const ShipStatItem: React.FCX<ShipStatItemProps> = ({ className, stat, onUpdate }) => {
  if (["speed", "range"].includes(stat.key)) {
    return <ShipStatLabel className={className} stat={stat} />
  }
  return <ShipStatButton className={className} stat={stat} onUpdate={onUpdate} />
}

const StyledStatItem = styled(ShipStatItem)`
  order: ${({ index }) => index};
`

type Props = {
  ship: Ship
  onUpdate: (changes: ShipChanges) => void
}

const keys: ShipStatKey[] = [
  "maxHp",
  "firepower",
  "armor",
  "torpedo",
  "evasion",
  "antiAir",
  "asw",
  "speed",
  "los",
  "range",
  "luck",
]

const ShipStats: React.FCX<Props> = ({ className, ship, onUpdate }) => {
  return (
    <div className={className}>
      {keys.map((key, index) => (
        <StyledStatItem key={key} index={index} stat={ship[key]} onUpdate={onUpdate} />
      ))}
      <Text id="fp">制空</Text>
    </div>
  )
}

export default styled(ShipStats)`
  display: grid;
  grid-template-columns: 50% 50%;

  > #fp {
    order: 5;
  }

  button {
    height: 20px;
    padding: 0;
    justify-content: flex-start;
  }
`
