import React from "react"
import { EntityId } from "@reduxjs/toolkit"
import styled from "styled-components"

import { NullableArray } from "../../../utils"
import { GearIndex } from "../../../store"

import SlotListItem from "./SlotListItem"

type Props = {
  currentSlots: number[]
  initalSlots: number[]
  gears: NullableArray<EntityId>
  onAdd: (index: GearIndex) => void
  onSlotsChange: (slots: number[]) => void
}

const EquipmentControl: React.FCX<Props> = ({ className, ...props }) => {
  return (
    <div className={className}>
      {props.gears.map((gear, index) => (
        <SlotListItem key={index} index={index} {...props} />
      ))}
    </div>
  )
}

const Styled = styled(EquipmentControl)`
  width: 100%;

  > * {
    height: 24px;
  }
`

export default React.memo(Styled)
