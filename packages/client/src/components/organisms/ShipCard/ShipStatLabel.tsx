import React from "react"
import styled from "styled-components"
import { BasicStatKey, ShipStats } from "@fleethub/core"

import { StatIcon, Text } from "../../../components"
import { withSign, getRangeName, getSpeedName } from "../../../utils"
import { Flexbox } from "../../atoms"

import ShipStatTooltip, { getDisplayedStr } from "./ShipStatTooltip"

const BonusText = styled(Text)`
  color: ${({ theme }) => theme.kc.palette.bonus};
  position: absolute;
  font-size: 10px;
  bottom: -3px;
  left: 10px;
`

const IncreaseText = styled(Text)`
  color: ${({ theme }) => theme.kc.palette.increase};
  position: absolute;
  font-size: 10px;
  top: -3px;
  left: 10px;
`

const DisplayedText = styled(Text)`
  margin-left: 4px;
  min-width: 24px;
  text-align: right;
  white-space: nowrap;
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

const ShipStatLabel: React.FCX<Props> = (props) => {
  const { className, statKey, stat } = props
  const displayedStr = getDisplayedStr(statKey, stat.displayed)
  let bonusStr: string | undefined
  let increaseStr: string | undefined
  if ("bonus" in stat && stat.bonus !== 0 && !["speed"].includes(statKey)) {
    bonusStr = withSign(stat.bonus)
  }
  if ("increase" in stat && stat.increase !== 0) {
    increaseStr = withSign(stat.increase)
  }

  return (
    <ShipStatTooltip {...props}>
      <Flexbox className={className}>
        <StatIcon icon={statKey} />
        <IncreaseText>{increaseStr}</IncreaseText>
        <BonusText>{bonusStr}</BonusText>
        <DisplayedText>{displayedStr}</DisplayedText>
      </Flexbox>
    </ShipStatTooltip>
  )
}

export default styled(ShipStatLabel)`
  position: relative;
  font-size: 0.75rem;
  line-height: 1.5;
`
