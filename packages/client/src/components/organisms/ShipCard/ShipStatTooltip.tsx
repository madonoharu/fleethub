import React from "react"
import styled from "styled-components"
import { BasicStatKey, ShipStats } from "@fleethub/core"

import { Tooltip, TooltipProps, Typography } from "@material-ui/core"

import { StatIcon, Text, Flexbox } from "../../../components"
import { withSign, getRangeName, getSpeedName, StatKeyDictionary, getBonusText } from "../../../utils"

export const getDisplayedStr = (key: string, value: number) => {
  if (key === "speed") return getSpeedName(value)
  if (key === "range") return getRangeName(value)
  return value.toString()
}

type Stat = Partial<ShipStats["firepower"]> & { displayed: number }

export type StatProps<K extends keyof ShipStats> = {
  statKey: K
  stat: Stat
}

type Props =
  | StatProps<BasicStatKey>
  | StatProps<"maxHp">
  | StatProps<"speed">
  | StatProps<"range">
  | StatProps<"luck">
  | StatProps<"accuracy">

const StatTitle: React.FCX<{ statKey: Props["statKey"]; displayed: string }> = ({ className, statKey, displayed }) => {
  const statNeme = StatKeyDictionary[statKey]
  return (
    <Flexbox className={className}>
      <StatIcon icon={statKey} />
      <Typography variant="subtitle2">
        <span>{statNeme}</span>
        {displayed}
      </Typography>
    </Flexbox>
  )
}

const SpaceBetween = styled(Flexbox)`
  justify-content: space-between;
`

const StyledStatTitle = styled(StatTitle)`
  ${StatIcon} {
    vertical-align: sub;
  }

  span {
    margin: 0 4px;
    color: ${({ theme, statKey }) => theme.kc.palette[statKey]};
  }
`

const ShipStatTooltip: React.FC<Props & Pick<TooltipProps, "children">> = ({ statKey, stat, children }) => {
  const { displayed, bonus, increase, equipment } = stat

  const title = (
    <>
      <StyledStatTitle statKey={statKey} displayed={getDisplayedStr(statKey, displayed)} />

      {bonus ? (
        <SpaceBetween>
          <Text>装備ボーナス</Text>
          <Text color="bonus">{getBonusText(statKey, bonus)}</Text>
        </SpaceBetween>
      ) : null}
      {increase ? (
        <SpaceBetween>
          <Text>増加値</Text>
          <Text color="increase">{withSign(increase)}</Text>
        </SpaceBetween>
      ) : null}
      {equipment ? (
        <SpaceBetween>
          <Text>装備合計</Text>
          <Text>{withSign(equipment)}</Text>
        </SpaceBetween>
      ) : null}
    </>
  )

  return <Tooltip title={title}>{children}</Tooltip>
}

export default ShipStatTooltip
