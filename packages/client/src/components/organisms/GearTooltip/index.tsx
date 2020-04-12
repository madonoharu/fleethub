import React from "react"
import { GearBase } from "@fleethub/core"
import styled from "styled-components"

import { Tooltip, Box } from "@material-ui/core"

import { GearNameplate } from "../../../components"

import GearStatList from "./GearStatList"

type Props = {
  gear: GearBase
  children: React.ReactElement
}

const GearTooltip: React.FC<Props> = ({ gear, ...rest }) => {
  return (
    <Tooltip
      enterDelay={300}
      enterNextDelay={300}
      title={
        <Box>
          <GearNameplate wrap size="small" iconId={gear.iconId} name={gear.name} />
          <GearStatList gear={gear} />
        </Box>
      }
      {...rest}
    />
  )
}

export default GearTooltip
