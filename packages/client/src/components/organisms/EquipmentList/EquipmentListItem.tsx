import React from "react"
import { Gear, GearState, getSlotKey, EquipmentState, EquipmentKey } from "@fleethub/core"

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

  equipmentKey: EquipmentKey
  updateEquipment: Update<EquipmentState>
}

const useEquipmentGearActions = ({ equipmentKey, updateEquipment }: Props) => {
  const gearSelectActions = useGearSelectActions()

  return React.useMemo(() => {
    const createGear = (gearState: GearState) => {
      updateEquipment((draft) => {
        draft[equipmentKey] = gearState
      })
    }

    const openGearSelect = () => gearSelectActions.open(createGear)

    const slotKey = getSlotKey(equipmentKey)

    const setSlotSize = (next: number | undefined) => {
      updateEquipment((draft) => {
        if (next === undefined) {
          delete draft[slotKey]
        } else {
          draft[slotKey] = next
        }
      })
    }

    const update: Update<GearState> = (updater) =>
      updateEquipment((draft) => {
        const state = draft[equipmentKey]
        state && updater(state)
      })

    const remove = () => {
      updateEquipment((draft) => {
        delete draft[equipmentKey]
      })
    }

    return { openGearSelect, setSlotSize, update, remove }
  }, [equipmentKey, updateEquipment, gearSelectActions])
}

const EquipmentListItem: React.FCX<Props> = ({ className, gear, currentSlotSize, maxSlotSize, ...rest }) => {
  const actions = useEquipmentGearActions(rest)

  const handleSlotSizeChange = (value: number) => {
    if (value === maxSlotSize) {
      actions.setSlotSize(undefined)
    } else {
      actions.setSlotSize(value)
    }
  }

  return (
    <Flexbox className={className}>
      <SlotSizeButton current={currentSlotSize} max={maxSlotSize} onChange={handleSlotSizeChange} />
      {gear ? (
        <GearLabel gear={gear} update={actions.update} onReselect={actions.openGearSelect} onRemove={actions.remove} />
      ) : (
        <AddGearButton onClick={actions.openGearSelect} />
      )}
    </Flexbox>
  )
}

export default EquipmentListItem
