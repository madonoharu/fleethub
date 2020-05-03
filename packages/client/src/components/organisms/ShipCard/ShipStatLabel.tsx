import React from "react"
import styled from "styled-components"
import { BasicStatKey, ShipStats } from "@fleethub/core"

import { StatIcon, Text } from "../../../components"
import { withSign, getRangeName, getSpeedName } from "../../../utils"
import { Flexbox } from "../../atoms"

import ShipStatTooltip from "./ShipStatTooltip"

const DisplayedText = styled(Text)`
  margin-left: 4px;
`

type StatProps<K extends keyof ShipStats> = {
  statKey: K
  stat: ShipStats[K]
}

type Props =
  | StatProps<BasicStatKey>
  | StatProps<"maxHp">
  | StatProps<"speed">
  | StatProps<"range">
  | StatProps<"luck">
  | StatProps<"accuracy">

export const getDisplayedStr = (key: string, value: number) => {
  if (key === "speed") return getSpeedName(value)
  if (key === "range") return getRangeName(value)
  return value.toString()
}

const ShipStatLabel: React.FCX<Props> = (props) => {
  const { className, statKey, stat } = props
  const displayedStr = getDisplayedStr(statKey, stat.displayed)

  return (
    <ShipStatTooltip {...props}>
      <Flexbox className={className}>
        <StatIcon icon={statKey} />
        <DisplayedText>{displayedStr}</DisplayedText>
      </Flexbox>
    </ShipStatTooltip>
  )
}

export default styled(ShipStatLabel)`
  font-size: 0.75rem;
  line-height: 1.5;
`
