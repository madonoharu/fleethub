import React from "react"
import { Gear } from "@fleethub/sim"
import { EquipmentBonuses } from "equipment-bonus"

import { Tooltip, TooltipProps } from "@material-ui/core"

import { Text } from "../../atoms"

import GearNameplate from "../GearNameplate"

import GearStatList from "./GearStatList"

type ContentProps = {
  gear: Gear
  ebonuses?: EquipmentBonuses
}

const Content: React.FC<ContentProps> = ({ gear, ebonuses }) => (
  <div>
    <Text>
      ID {gear.gear_id} {gear.category}
    </Text>
    <GearNameplate wrap iconId={gear.icon_id} name={gear.name} />
    <GearStatList gear={gear} ebonuses={ebonuses} />
  </div>
)

type Props = ContentProps & Omit<TooltipProps, "title">

const GearTooltip: React.FC<Props> = ({ gear, ebonuses, ...rest }) => (
  <Tooltip title={<Content gear={gear} ebonuses={ebonuses} />} {...rest} />
)

export default GearTooltip
