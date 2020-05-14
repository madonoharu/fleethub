import React from "react"
import { Gear, GearState, getEquipmentSlotKey, EquipmentState, EquipmentGearKey } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { GearLabel, Flexbox } from "../../../components"
import { useGearSelectActions } from "../../../hooks"
import { Update } from "../../../utils"

import SlotSizeButton from "./SlotSizeButton"
import AddGearButton from "./AddGearButton"

type Props = {
  gear?: Gear
  currentSlotSize?: number
  maxSlotSize?: number

  gearKey: EquipmentGearKey
  updateEquipment: Update<EquipmentState>
}

const useEquipmentGearActions = ({ gearKey, updateEquipment }: Props) => {
  const gearSelectActions = useGearSelectActions()

  return React.useMemo(() => {
    const createGear = (gearState: GearState) => {
      updateEquipment((draft) => {
        draft[gearKey] = gearState
      })
    }

    const openGearSelect = () => gearSelectActions.open(createGear)

    const slotKey = getEquipmentSlotKey(gearKey)

    const changeSlotSize = (next?: number) => {
      updateEquipment((draft) => {
        draft[slotKey] = next
      })
    }

    const updateGear: Update<GearState> = (updater) =>
      updateEquipment((draft) => {
        const state = draft[gearKey]
        state && updater(state)
      })

    const remove = () => {
      updateEquipment((draft) => {
        delete draft[gearKey]
      })
    }

    return { openGearSelect, updateGear, changeSlotSize, remove }
  }, [gearKey, updateEquipment, gearSelectActions])
}

const EquipmentListItem: React.FCX<Props> = ({ className, gear, currentSlotSize, maxSlotSize, ...rest }) => {
  const { openGearSelect, updateGear, changeSlotSize, remove } = useEquipmentGearActions(rest)

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
