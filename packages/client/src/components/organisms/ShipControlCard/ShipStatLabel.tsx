import React from "react"
import styled from "styled-components"
import { ShipStat } from "@fleethub/core"

import { StatIcon, Text } from "../../../components"
import { withSign, getRangeName, getSpeedName } from "../../../utils"
import { Flexbox } from "../../atoms"

const getStatText = (stat: ShipStat): React.ReactChild => {
  const { key, displayed, bonus, modernization } = stat

  if (key === "speed") {
    const str = getSpeedName(displayed)
    return bonus ? <Text color="bonus">{str}</Text> : str
  }
  if (key === "range") {
    const str = getRangeName(displayed)
    return bonus ? <Text color="bonus">{str}</Text> : str
  }

  const visibleBonus = Boolean(modernization || bonus)
  return (
    <>
      <Text>{displayed}</Text>
      {visibleBonus && (
        <>
          (<Text color="modernization">{withSign(modernization)}</Text>
          <Text color="bonus">{withSign(bonus)}</Text>)
        </>
      )}
    </>
  )
}

type Props = {
  stat: ShipStat
}

const ShipStatLabel: React.FCX<Props> = (props) => {
  const { className, stat } = props

  const text = getStatText(stat)

  return (
    <Flexbox className={className}>
      <StatIcon icon={stat.key} />
      {text}
    </Flexbox>
  )
}

export default styled(ShipStatLabel)`
  font-size: 0.75rem;
  line-height: 1.5;

  ${StatIcon} {
    margin: 0 4px;
  }
`
