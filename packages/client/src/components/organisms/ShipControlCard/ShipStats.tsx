import React from "react"
import styled from "styled-components"
import { Ship, ShipStatKey } from "@fleethub/core"

import { StatIcon, Flexbox } from "../../../components"
import { ShipChanges } from "../../../store"

import ShipStatButton from "./ShipStatButton"
import ShipStatText from "./ShipStatText"

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
      {keys.map((key) => (
        <ShipStatButton key={key} stat={ship[key]} onUpdate={onUpdate} />
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
