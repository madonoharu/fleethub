import React from "react"
import { GearBase } from "@fleethub/core"
import clsx from "clsx"

import Box from "@material-ui/core/Box"
import { Tooltip } from "@material-ui/core"

import { Flexbox, Text, GearNameplate } from "../../../components"

const keys = [
  "armor",
  "firepower",
  "torpedo",
  "speed",
  "bombing",
  "antiAir",
  "asw",
  "accuracy",
  "interception",
  "evasion",
  "antiBomber",
  "los",
  "luck",

  "range",
  "radius",
  "cost",
] as const

type Props = {
  gear: GearBase
  children: React.ReactElement
}

const GearTooltip: React.FC<Props> = ({ gear, ...rest }) => {
  const stats = keys.map((key) => [key, gear[key]] as const).filter(([key, stat]) => stat !== 0)
  const statElements = stats.map(([key, stat]) => (
    <Text key={key}>
      {key}: {stat}
    </Text>
  ))

  return (
    <Tooltip
      enterDelay={300}
      title={
        <Box>
          <GearNameplate wrap size="small" iconId={gear.iconId} name={gear.name} />
          <Text>id: {gear.gearId}</Text>
          {statElements}
        </Box>
      }
      {...rest}
    />
  )
}

export default GearTooltip
