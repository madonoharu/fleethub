import React from "react"
import { GearBase, isNonNullable } from "@fleethub/core"
import styled from "styled-components"

import { Table as MuiTable, TableBody, TableRow, TableCell as MuiTableCell } from "@material-ui/core"

import { StatIcon, Text } from "../../../components"
import { StatKeyDictionary, getRangeName } from "../../../utils"

const Table = styled(MuiTable)`
  width: auto;
`

const TableCell = styled(MuiTableCell)`
  padding: 0 4px;
  border: none;
  font-size: 0.75rem;
`
const keys = [
  "firepower",
  "torpedo",
  "antiAir",
  "asw",
  "bombing",
  "accuracy",
  "evasion",
  "interception",
  "antiBomber",
  "los",
  "armor",
  "range",
  "radius",
] as const

type Key = typeof keys[number]
type StatEntry = [Key, number | string]

export const toStatEntries = (gear: GearBase) =>
  keys
    .map((key): StatEntry | undefined => {
      const value = gear[key]
      if (value === 0) return

      if (key === "range") return [key, getRangeName(value)]
      return [key, value]
    })
    .filter(isNonNullable)

type Props = {
  gear: GearBase
}

const GearStatList: React.FC<Props> = ({ gear }) => {
  const entries = toStatEntries(gear)
  return (
    <>
      <Table size="small">
        <TableBody>
          {entries.map(([key, value]) => (
            <TableRow key={key}>
              <TableCell>
                <StatIcon icon={key} />
              </TableCell>
              <TableCell>{StatKeyDictionary[key]}</TableCell>
              <TableCell align="right">{value}</TableCell>
            </TableRow>
          ))}
          {Boolean(gear.cost) && (
            <TableRow>
              <TableCell>{StatKeyDictionary.cost}</TableCell>
              <TableCell>{gear.cost}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Text align="right">ID {gear.gearId}</Text>
    </>
  )
}

export default GearStatList
