import React from "react"
import styled from "styled-components"
import { Ship } from "@fleethub/core"

import ShipStatLabel from "./ShipStatLabel"

const keys = [
  "maxHp",
  "firepower",
  "armor",
  "torpedo",
  "evasion",
  "antiAir",
  "accuracy",
  "asw",
  "speed",
  "los",
  "range",
  "luck",
] as const

type Props = {
  ship: Ship
}

const ShipStats: React.FCX<Props> = ({ className, ship }) => {
  return (
    <div className={className}>
      {keys.map((statKey) => (
        <ShipStatLabel key={statKey} statKey={statKey} stat={ship[statKey]} />
      ))}
    </div>
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
