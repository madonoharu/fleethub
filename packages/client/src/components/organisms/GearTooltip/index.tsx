import React from "react"
import { GearBase } from "@fleethub/core"
import styled from "styled-components"

import { Tooltip, Box, Table as MuiTable, TableBody, TableRow, TableCell as MuiTableCell } from "@material-ui/core"

import { Flexbox, Text, GearNameplate, StatIcon } from "../../../components"
import { StatKeyDictionary } from "../../../utils"

const Table = styled(MuiTable)`
  width: auto;
`

const TableCell = styled(MuiTableCell)`
  padding: 0 4px;
  border: none;
  font-size: 0.75rem;
`

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

  return (
    <Tooltip
      enterDelay={300}
      enterNextDelay={300}
      title={
        <Box>
          <GearNameplate wrap size="small" iconId={gear.iconId} name={gear.name} />
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>{gear.gearId}</TableCell>
              </TableRow>
              {stats.map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>
                    <StatIcon icon={key} />
                  </TableCell>
                  <TableCell>{StatKeyDictionary[key]}</TableCell>
                  <TableCell>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      }
      {...rest}
    />
  )
}

export default GearTooltip
