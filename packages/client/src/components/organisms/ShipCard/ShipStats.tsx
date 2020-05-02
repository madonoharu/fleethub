import React from "react"
import styled from "styled-components"
import { Ship } from "@fleethub/core"

import { Text, StatIcon } from "../../../components"
import { ShipChanges } from "../../../store"

type Props = {
  ship: Ship
  onUpdate: (changes: ShipChanges) => void
}

const ShipStats: React.FCX<Props> = ({ className, ship, onUpdate }) => {
  return (
    <div className={className}>
      <Text>
        <StatIcon icon="maxHp" />
        {ship.maxHp.displayed}
      </Text>
      <Text>
        <StatIcon icon="firepower" />
        {ship.firepower.displayed}
      </Text>
      <Text>
        <StatIcon icon="armor" />
        {ship.armor.displayed}
      </Text>
      <Text>
        <StatIcon icon="torpedo" />
        {ship.torpedo.displayed}
      </Text>
      <Text>
        <StatIcon icon="evasion" />
        {ship.evasion.displayed}
      </Text>
      <Text id="fp">制空</Text>
      <Text>
        <StatIcon icon="antiAir" />
        {ship.antiAir.displayed}
      </Text>
      <Text>
        <StatIcon icon="asw" />
        {ship.asw.displayed}
      </Text>
      <Text>
        <StatIcon icon="speed" />
        {ship.speed.displayed}
      </Text>
      <Text>
        <StatIcon icon="los" />
        {ship.los.displayed}
      </Text>
      <Text>
        <StatIcon icon="range" />
        {ship.range.displayed}
      </Text>
      <Text>
        <StatIcon icon="luck" />
        {ship.luck.displayed}
      </Text>
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
