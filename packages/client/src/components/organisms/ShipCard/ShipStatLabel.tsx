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

const getStatText = (props: Props): React.ReactChild => {
  if (props.statKey === "maxHp") {
    const { displayed, increase } = props.stat
    return <DisplayedText>{displayed}</DisplayedText>
  }
  if (props.statKey === "speed") {
    const { displayed, bonus } = props.stat
    const str = getSpeedName(displayed)
    return <DisplayedText>{str}</DisplayedText>
  }
  if (props.statKey === "range") {
    const { displayed, bonus } = props.stat
    const str = getRangeName(displayed)
    return <DisplayedText>{str}</DisplayedText>
  }
  if (props.statKey === "luck") {
    const { displayed } = props.stat
    return <DisplayedText>{displayed}</DisplayedText>
  }
  if (props.statKey === "accuracy") {
    const { displayed, bonus } = props.stat
    return <DisplayedText>{displayed}</DisplayedText>
  }

  const { displayed, increase, bonus } = props.stat

  return <DisplayedText>{displayed}</DisplayedText>
}

const ShipStatLabel: React.FCX<Props> = (props) => {
  const { className, statKey, stat } = props
  const text = getStatText(props)

  return (
    <ShipStatTooltip {...props}>
      <Flexbox className={className}>
        <StatIcon icon={statKey} />
        {text}
      </Flexbox>
    </ShipStatTooltip>
  )
}

export default styled(ShipStatLabel)`
  font-size: 0.75rem;
  line-height: 1.5;
`
