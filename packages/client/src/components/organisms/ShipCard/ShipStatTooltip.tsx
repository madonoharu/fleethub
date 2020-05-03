import React from "react"
import styled from "styled-components"
import { BasicStatKey, ShipStats } from "@fleethub/core"

import { Tooltip, TooltipProps } from "@material-ui/core"

import { StatIcon, Text } from "../../../components"
import { withSign, getRangeName, getSpeedName, StatKeyDictionary } from "../../../utils"
import { Flexbox } from "../../atoms"

import { getDisplayedStr } from "./ShipStatLabel"

const isNumber = (value: unknown): value is number => typeof value === "number"

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
      {isNumber(displayed) && <Text>表示 {getDisplayedStr(statKey, displayed)}</Text>}
      {isNumber(bonus) && <Text>装備ボーナス {bonus}</Text>}
      {isNumber(increase) && <Text>増加値 {increase}</Text>}
      {isNumber(equipment) && <Text>装備合計 {equipment}</Text>}
    </>
  )

  return <Tooltip title={title}>{children}</Tooltip>
}

export default ShipStatTooltip
