import React from "react"
import styled from "styled-components"
import { BasicStatKey, ShipStats } from "@fleethub/core"

import { Tooltip, TooltipProps } from "@material-ui/core"

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

const ShipStatTooltip: React.FC<Props & Pick<TooltipProps, "children">> = ({ statKey, stat, children }) => {
  const statNemae = StatKeyDictionary[statKey]
  const title = <Text>{statNemae}</Text>

  return <Tooltip title={title}>{children}</Tooltip>
}

export default ShipStatTooltip
