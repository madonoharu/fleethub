import React from "react"
import { GearBase, isNonNullable } from "@fleethub/core"
import styled from "styled-components"

import { Table as MuiTable, TableBody, TableRow, TableCell as MuiTableCell } from "@material-ui/core"

import { StatIcon, Text, Flexbox } from "../../../components"
import { StatKeyDictionary, getRangeName } from "../../../utils"

const Table = styled(MuiTable)`
  width: auto;
`

const TableCell = styled(MuiTableCell)`
  padding: 0 4px;
  border: none;
`
const BonusCell = styled(TableCell)`
  color: ${({ theme }) => theme.kc.bonus};
`

const SpaceBetween = styled.div`
  display: flex;
  justify-content: space-between;
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

export type EquipmentBonuses = Partial<Record<Key, number>>

export const toStatEntries = (gear: GearBase) =>
  keys
    .map((key): StatEntry | undefined => {
      const value = gear[key]
      if (value === 0) return

      if (key === "range") return [key, getRangeName(value)]
      return [key, value]
    })
    .filter(isNonNullable)

export type Props = {
  gear: GearBase
  bonuses?: EquipmentBonuses
}

const GearStatList: React.FC<Props> = ({ gear, bonuses }) => {
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
              <BonusCell>{bonuses?.[key] && `+${bonuses[key]}`}</BonusCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SpaceBetween>
        <Text>{gear.cost > 0 && `${StatKeyDictionary.cost} ${gear.cost}`}</Text>
        <Text>ID {gear.gearId}</Text>
      </SpaceBetween>
    </>
  )
}

export default GearStatList
