import React from "react"
import styled from "styled-components"
import { BasicStatKey, ShipStats } from "@fleethub/core"

import { Tooltip, TooltipProps } from "@material-ui/core"

import { StatIcon, Text } from "../../../components"
import { withSign, getRangeName, getSpeedName, StatKeyDictionary } from "../../../utils"
import { Flexbox } from "../../atoms"

type Stat = Partial<ShipStats["firepower"]>

type StatProps<K extends keyof ShipStats> = {
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

const ShipStatTooltip: React.FC<Props & Pick<TooltipProps, "children">> = ({ statKey, stat, children }) => {
  const statNemae = StatKeyDictionary[statKey]

  const { displayed, bonus, increase, equipment } = stat

  const title = (
    <>
      <Text>{statNemae}</Text>
      <Text>表示 {displayed}</Text>
      <Text>装備ボーナス {bonus}</Text>
      <Text>増加値 {increase}</Text>
      <Text>装備合計 {equipment}</Text>
    </>
  )

  return <Tooltip title={title}>{children}</Tooltip>
}

export default ShipStatTooltip
