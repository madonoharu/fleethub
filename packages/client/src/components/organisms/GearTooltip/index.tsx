import React from "react"
import { GearBase, EquipmentBonuses } from "@fleethub/core"
import styled from "styled-components"

import { Tooltip, TooltipProps } from "@material-ui/core"

import { GearNameplate, Text } from "../../../components"

import GearStatList from "./GearStatList"
import { GearCategoryName } from "@fleethub/data"

type ContentProps = {
  gear: GearBase
  bonuses?: EquipmentBonuses
}

const Content: React.FC<ContentProps> = ({ gear, bonuses }) => (
  <div>
    <Text>
      ID {gear.gearId} {GearCategoryName[gear.category]}
    </Text>
    <GearNameplate wrap iconId={gear.iconId} name={gear.name} />
    <GearStatList gear={gear} bonuses={bonuses} />
  </div>
)

type Props = ContentProps & Omit<TooltipProps, "title">

const GearTooltip: React.FC<Props> = ({ gear, bonuses, ...rest }) => (
  <Tooltip title={<Content gear={gear} bonuses={bonuses} />} {...rest} />
)

export default GearTooltip
