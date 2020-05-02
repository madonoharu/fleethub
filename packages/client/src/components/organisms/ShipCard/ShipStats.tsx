import React from "react"
import styled from "styled-components"
import { Ship } from "@fleethub/core"

import { Text, StatIcon } from "../../../components"
import { ShipChanges } from "../../../store"

import ShipStatLabel from "./ShipStatLabel"

type Props = {
  ship: Ship
  onUpdate: (changes: ShipChanges) => void
}

const ShipStats: React.FCX<Props> = ({ className, ship, onUpdate }) => {
  return (
    <div className={className}>
      {(["maxHp", "firepower", "armor", "torpedo", "evasion", "antiAir"] as const).map((statKey) => (
        <ShipStatLabel key={statKey} statKey={statKey} stat={ship[statKey]} />
      ))}

      <Text id="fp">制空</Text>

      {(["asw", "speed", "los", "range", "luck"] as const).map((statKey) => (
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
