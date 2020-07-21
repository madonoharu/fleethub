import React from "react"
import { GearBase, isNonNullable, EquipmentBonuses } from "@fleethub/core"
import styled from "styled-components"

import { Table as MuiTable, TableBody, TableRow, TableCell as MuiTableCell, TableCellProps } from "@material-ui/core"

import { StatIcon } from "../../../components"
import { StatKeyDictionary, getRangeName, getBonusText } from "../../../utils"

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
  "speed",
  "range",
  "radius",
] as const

type Key = typeof keys[number]
type Value = number | string
type StatEntry = [Key, Value, Value?]

const Table = styled(MuiTable)`
  width: auto;
`

const TableCell = styled(({ statKey, ...props }: { statKey?: Key } & TableCellProps) => <MuiTableCell {...props} />)`
  padding: 0 4px;
  border: none;
  color: ${({ theme, statKey }) => statKey && theme.colors[statKey]};
`

const BonusCell = styled(TableCell)`
  color: ${({ theme }) => theme.colors.bonus};
`

const StyledStatIcon = styled(StatIcon)`
  display: block !important;
`

export const toStatEntries = (gear: GearBase, bonuses?: EquipmentBonuses) =>
  keys
    .map((key): StatEntry | undefined => {
      const value = gear[key]

      let bonus = ""
      if (bonuses && key !== "interception" && key !== "antiBomber" && key !== "radius") {
        bonus = getBonusText(key, bonuses[key])
      }

      if (!value && !bonus) return

      if (key === "range") return [key, getRangeName(value), bonus]
      if (key === "speed") return [key, "", bonus]
      return [key, value, bonus]
    })
    .filter(isNonNullable)

export type Props = {
  gear: GearBase
  bonuses?: EquipmentBonuses
}

const GearStatList: React.FC<Props> = ({ gear, bonuses }) => {
  const entries = toStatEntries(gear, bonuses)
  return (
    <Table size="small">
      <TableBody>
        {entries.map(([key, value, bonus]) => (
          <TableRow key={key}>
            <TableCell>
              <StyledStatIcon icon={key} />
            </TableCell>
            <TableCell statKey={key}>{StatKeyDictionary[key]}</TableCell>
            <TableCell align="right">{value}</TableCell>
            <BonusCell>{bonus}</BonusCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default GearStatList
