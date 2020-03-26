import React from "react"
import { EntityId } from "@reduxjs/toolkit"
import styled from "styled-components"

import Button from "@material-ui/core/Button"

import { GearControlLabel } from "../.."
import { NullableArray } from "../../../utils"
import { GearIndex } from "../../../store"

import SlotSizeButton from "./SlotSizeButton"

type ListItemProps = {
  currentSlot?: number
  initalSlot?: number
  gear?: EntityId
  onAdd: () => void
  onSlotChange: (value: number) => void
}

const ListItem: React.FCX<ListItemProps> = ({ className, currentSlot, initalSlot, gear, onAdd, onSlotChange }) => {
  return (
    <div className={className}>
      <SlotSizeButton current={currentSlot} inital={initalSlot} onChange={onSlotChange} />
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
  currentSlots: number[]
  initalSlots: number[]
  gears: NullableArray<EntityId>
  onAdd: (index: GearIndex) => void
  onSlotsChange: (slots: number[]) => void
}

const Componemt: React.FCX<Props> = ({ className, currentSlots, initalSlots, gears, onAdd, onSlotsChange }) => {
  const handleSlotChange = (index: number) => (value: number) => {
    const next = currentSlots.concat()
    next[index] = value
    onSlotsChange(next)
  }

  return (
    <div className={className}>
      {gears.map((gear, index) => (
        <StyledListItem
          key={index}
          gear={gear}
          currentSlot={currentSlots[index]}
          initalSlot={initalSlots[index]}
          onAdd={() => onAdd(index)}
          onSlotChange={handleSlotChange(index)}
        />
      ))}
    </div>
  )
}

const StyledComponemt = styled(Componemt)`
  width: 100%;
  ${StyledListItem} {
    height: 24px;
  }
`

export default StyledComponemt
