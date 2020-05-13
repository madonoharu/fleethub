import React from "react"
import { Gear, EquipmentState, NullableArray } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { GearLabel, Flexbox } from "../../../components"

import SlotSizeButton from "./SlotSizeButton"
import AddGearButton from "./AddGearButton"
import { useEquipmentGear, EquipmentGearProps } from "./useEquipmentGear"

type Props = EquipmentGearProps & {
  gear?: Gear
  currentSlotSize?: number
  maxSlotSize?: number
}

const EquipmentListItem: React.FCX<Props> = ({ className, gear, currentSlotSize, maxSlotSize, ...rest }) => {
  const { openGearSelect, updateGear, changeSlotSize, remove } = useEquipmentGear(rest)

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
