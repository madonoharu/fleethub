import React from "react"
import styled from "styled-components"
import { ShipStat } from "@fleethub/core"

import Typography from "@material-ui/core/Typography"

import { withSign, getRangeName, getSpeedName } from "../../../utils"

const ModernizationText = styled.span`
  color: ${({ theme }) => theme.palette.secondary.light};
`

const BonusText = styled.span`
  color: ${({ theme }) => theme.kc.palette.bonus};
`

const getStatText = (stat: ShipStat): React.ReactChild => {
  const { key, displayed, bonus, modernization } = stat

  if (key === "speed") return getSpeedName(displayed)
  if (key === "range") return getRangeName(displayed)

  const visibleBonus = Boolean(modernization || bonus)
  return (
    <>
      <span>{displayed}</span>
      {visibleBonus && (
        <>
          (<ModernizationText>{withSign(modernization)}</ModernizationText>
          <BonusText>{withSign(bonus)}</BonusText>)
        </>
      )}
    </>
  )
}

type Props = {
  stat: ShipStat
}

const StatLabel: React.FCX<Props> = (props) => {
  const { className, stat } = props

  const text = getStatText(stat)

  return (
    <Typography className={className} variant="inherit">
      {text}
    </Typography>
  )
}

export default styled(StatLabel)`
  font-size: 0.75rem;
  line-height: 1.5;
`
