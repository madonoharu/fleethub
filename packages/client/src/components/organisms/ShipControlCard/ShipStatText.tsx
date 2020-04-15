import React from "react"
import styled from "styled-components"
import { ShipStat } from "@fleethub/core"

import Typography from "@material-ui/core/Typography"

import { withSign, getRangeName } from "../../../utils"

const ModernizationText = styled.span`
  color: ${({ theme }) => theme.palette.secondary.light};
`

const BonusText = styled.span`
  color: ${({ theme }) => theme.kc.palette.bonus};
`

type Props = {
  stat: ShipStat
}

const StatLabel: React.FCX<Props> = (props) => {
  const { className, stat } = props
  const { key, displayed, bonus, modernization } = stat
  if (key === "range") {
    return (
      <Typography className={className} variant="inherit">
        {getRangeName(displayed)}
      </Typography>
    )
  }
  const visibleBonus = Boolean(modernization || bonus)

  return (
    <Typography className={className} variant="inherit">
      <span>{displayed}</span>
      {visibleBonus && (
        <>
          (<ModernizationText>{withSign(modernization)}</ModernizationText>
          <BonusText>{withSign(bonus)}</BonusText>)
        </>
      )}
    </Typography>
  )
}

export default styled(StatLabel)`
  font-size: 0.75rem;
  line-height: 1.5;
`
