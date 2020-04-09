import React from "react"
import { EntityId } from "@reduxjs/toolkit"
import styled from "styled-components"

import Button from "@material-ui/core/Button"

import { GearLabel, Flexbox } from "../.."
import { NullableArray } from "../../../utils"
import { GearIndex } from "../../../store"

import SlotSizeButton from "./SlotSizeButton"
import AddGearButton from "./AddGearButton"

export type Props = {
  index: number

  currentSlots: number[]
  initalSlots: number[]
  gears: NullableArray<EntityId>
  onAdd: (index: GearIndex) => void
  onSlotsChange: (slots: number[]) => void
}

const SlotListItem: React.FCX<Props> = ({
  className,
  index,
  currentSlots,
  initalSlots,
  gears,
  onAdd,
  onSlotsChange,
}) => {
  const handleSlotChange = React.useCallback(
    (value: number) => {
      const next = currentSlots.concat()
      next[index] = value
      onSlotsChange(next)
    },
    [index, currentSlots, onSlotsChange]
  )

  const handleAdd = React.useCallback(() => onAdd(index), [index, onAdd])

  const gear = gears[index]
  const currentSlot = currentSlots[index]
  const initalSlot = initalSlots[index]

  return (
    <Flexbox className={className}>
      <SlotSizeButton current={currentSlot} inital={initalSlot} onChange={handleSlotChange} />
      {gear ? <GearLabel gear={gear} onReselect={handleAdd} /> : <AddGearButton onClick={handleAdd} />}
    </Flexbox>
  )
}

export default SlotListItem
