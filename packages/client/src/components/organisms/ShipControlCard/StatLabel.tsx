import React from "react"
import styled from "styled-components"
import { ShipStat } from "@fleethub/kcsim"
import { useTranslation } from "react-i18next"

import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"

import { StatIcon } from "../.."

const valueToString = (value?: number) => {
  if (!value) {
    return ""
  }
  return value > 0 ? `+${value}` : `${value}`
}

type StatKey = "firepower" | "torpedo" | "antiAir" | "armor" | "asw" | "los" | "evasion" | "hp"

type Props = {
  statKey: StatKey
  stat: Partial<ShipStat>
  disableTooltip?: boolean
}

const StatLabel: React.FCX<Props> = (props) => {
  const { className, statKey, stat, disableTooltip } = props
  const { t } = useTranslation()

  const bonus = 0
  const visibleBonus = Boolean(stat.modernization || bonus)

  const label = (
    <div className={className}>
      <StatIcon icon={statKey} />
      <Typography>{stat.displayed}</Typography>
      {visibleBonus && (
        <>
          <Typography>(</Typography>
          <Typography color="primary">{valueToString(stat.modernization)}</Typography>
          <Typography color="secondary">{valueToString(stat.bonus)}</Typography>
          <Typography>)</Typography>
        </>
      )}
    </div>
  )

  if (disableTooltip) {
    return label
  }

  const statName = statKey

  return <Tooltip title={t("火力")}>{label}</Tooltip>
}

export default styled(StatLabel)`
  display: flex;
  align-items: center;
  p {
    font-size: 0.75rem;
    line-height: 1.5;
  }
  ${StatIcon} {
    margin: 0 4px;
  }
`
