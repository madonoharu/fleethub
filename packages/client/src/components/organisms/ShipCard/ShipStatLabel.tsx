import React from "react"
import styled from "styled-components"
import { BasicStatKey, ShipStats } from "@fleethub/core"

import { Tooltip } from "@material-ui/core"

import { StatIcon, Text } from "../../../components"
import { withSign, getRangeName, getSpeedName, StatKeyDictionary } from "../../../utils"
import { Flexbox } from "../../atoms"

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
    return displayed
  }
  if (props.statKey === "speed") {
    const { displayed, bonus } = props.stat
    const str = getSpeedName(displayed)
    return bonus ? <Text color="bonus">{str}</Text> : str
  }
  if (props.statKey === "range") {
    const { displayed, bonus } = props.stat
    const str = getRangeName(displayed)
    return bonus ? <Text color="bonus">{str}</Text> : str
  }
  if (props.statKey === "luck") {
    const { displayed } = props.stat
    return <Text>{displayed}</Text>
  }
  if (props.statKey === "accuracy") {
    const { displayed } = props.stat
    return displayed
  }

  const { displayed, increase, bonus } = props.stat

  const visibleBonus = Boolean(increase || bonus)
  return (
    <>
      <Text>{displayed}</Text>
      {visibleBonus && (
        <>
          (<Text color="increase">{withSign(increase)}</Text>
          <Text color="bonus">{withSign(bonus)}</Text>)
        </>
      )}
    </>
  )
}

const ShipStatLabel: React.FCX<Props> = (props) => {
  const { className, statKey } = props
  const text = getStatText(props)

  return (
    <Tooltip title={StatKeyDictionary[statKey]}>
      <Flexbox className={className}>
        <StatIcon icon={statKey} />
        {text}
      </Flexbox>
    </Tooltip>
  )
}

export default styled(ShipStatLabel)`
  font-size: 0.75rem;
  line-height: 1.5;

  ${StatIcon} {
    margin: 0 4px;
  }
`
