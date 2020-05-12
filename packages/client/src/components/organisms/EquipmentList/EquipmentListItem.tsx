import React from "react"
import { GearState, EquipmentState, NullableArray } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { GearLabel, Flexbox } from "../.."

import SlotSizeButton from "./SlotSizeButton"
import AddGearButton from "./AddGearButton"
import { useEquipmentGear, EquipmentGearProps } from "./useEquipmentGear"

type Props = EquipmentGearProps & {
  currentSlotSize?: number
  maxSlotSize?: number
}

const EquipmentListItem: React.FCX<Props> = ({ className, currentSlotSize, maxSlotSize, ...rest }) => {
  const { gear, openGearSelect, updateGear, changeSlotSize, remove } = useEquipmentGear(rest)

  return (
    <Flexbox className={className}>
      <SlotSizeButton current={currentSlotSize} max={maxSlotSize} onChange={changeSlotSize} />
      {gear ? (
        <GearLabel gear={gear} update={updateGear} onReselect={openGearSelect} onRemove={remove} />
      ) : (
        <AddGearButton onClick={openGearSelect} />
      )}
    </Flexbox>
  )
}

export default EquipmentListItem
