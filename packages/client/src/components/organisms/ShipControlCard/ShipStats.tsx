import React from "react"
import styled from "styled-components"
import { Ship } from "@fleethub/core"

import { ShipChanges } from "../../../store"

import ShipStatButton from "./ShipStatButton"

type Props = {
  ship: Ship
  onUpdate: (changes: ShipChanges) => void
}

const keys = ["maxHp", "firepower", "torpedo", "antiAir", "armor", "asw", "los", "evasion", "luck"] as const
export type StatKey = typeof keys[number]

const ShipStats: React.FCX<Props> = ({ className, ship, onUpdate }) => {
  return (
    <div className={className}>
      {keys.map((key) => (
        <ShipStatButton key={key} statKey={key} stat={ship[key]} onUpdate={onUpdate} />
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
