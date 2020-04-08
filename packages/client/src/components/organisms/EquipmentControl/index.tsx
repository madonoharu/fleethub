import React from "react"
import { EntityId } from "@reduxjs/toolkit"
import styled from "styled-components"

import Button from "@material-ui/core/Button"

import { GearControlLabel, Flexbox } from "../../../components"
import { NullableArray } from "../../../utils"
import { GearIndex } from "../../../store"

import SlotSizeButton from "./SlotSizeButton"

type Props = {
  currentSlots: number[]
  initalSlots: number[]
  gears: NullableArray<EntityId>
  onAdd: (index: GearIndex) => void
  onSlotsChange: (slots: number[]) => void
}

type SlotGearProps = Props & { index: number }

const SlotGear: React.FCX<SlotGearProps> = ({
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
      <GearControlLabel gear={gear} onAdd={handleAdd} />
    </Flexbox>
  )
}

const StyledSlotGear = styled(SlotGear)`
  height: 24px;
`

const EquipmentControl: React.FCX<Props> = ({ className, ...props }) => {
  return (
    <div className={className}>
      {props.gears.map((gear, index) => (
        <StyledSlotGear key={index} index={index} {...props} />
      ))}
    </div>
  )
}

const StyledComponemt = styled(EquipmentControl)`
  width: 100%;
`

export default React.memo(StyledComponemt)
