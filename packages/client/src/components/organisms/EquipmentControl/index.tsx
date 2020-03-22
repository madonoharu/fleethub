import React from "react"
import { EntityId } from "@reduxjs/toolkit"
import styled from "styled-components"

import Button from "@material-ui/core/Button"

import { GearControlLabel } from "../.."
import { NullableArray } from "../../../utils"
import { GearIndex } from "../../../store"

import SlotSizeButton from "./SlotSizeButton"

type ListItemProps = {
  slot?: number
  max?: number
  gear?: EntityId
  onAdd: () => void
}

const ListItem: React.FCX<ListItemProps> = ({ className, slot, max, gear, onAdd }) => {
  return (
    <div className={className}>
      <SlotSizeButton value={slot} max={max} />
      <GearControlLabel gear={gear} onAdd={onAdd} />
    </div>
  )
}

const StyledListItem = styled(ListItem)`
  display: flex;
  ${SlotSizeButton} {
    flex-shrink: 0;
  }
  > * {
    min-width: 0;
  }
`

type Props = {
  slots: number[]
  gears: NullableArray<EntityId>
  onAdd: (index: GearIndex) => void
}

const Componemt: React.FCX<Props> = ({ className, gears, onAdd }) => {
  const slots = [1, 20, 300]
  return (
    <div className={className}>
      {gears.map((gear, index) => (
        <StyledListItem key={index} gear={gear} slot={slots[index]} max={slots[index]} onAdd={() => onAdd(index)} />
      ))}
    </div>
  )
}

const StyledComponemt = styled(Componemt)`
  ${StyledListItem} {
    height: 24px;
  }
`

export default StyledComponemt
