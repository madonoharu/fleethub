import React from "react"
import { Gear, GearState, getSlotKey, EquipmentState, EquipmentKey, GearBase, EquipmentBonuses } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { GearLabel, Flexbox } from "../../../components"
import { useGearSelectActions } from "../../../hooks"
import { Update } from "../../../utils"

import SlotSizeButton from "./SlotSizeButton"
import AddGearButton from "./AddGearButton"

export type Props = {
  gear?: Gear
  currentSlotSize?: number
  maxSlotSize?: number

  equipmentKey: EquipmentKey
  updateEquipment: Update<EquipmentState>

  canEquip?: (key: EquipmentKey, gear: GearBase) => boolean
  makeGetNextBonuses?: (key: EquipmentKey) => (gear: GearBase) => EquipmentBonuses
}

const useEquipmentGearActions = ({ equipmentKey, updateEquipment }: Props) => {
  return React.useMemo(() => {
    const create = (gearState: GearState) => {
      updateEquipment((draft) => {
        draft[equipmentKey] = gearState
      })
    }

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

    return { setSlotSize, create, update, remove }
  }, [equipmentKey, updateEquipment])
}

const EquipmentListItem: React.FCX<Props> = (props) => {
  const { className, equipmentKey, gear, currentSlotSize, maxSlotSize, canEquip, makeGetNextBonuses } = props

  const actions = useEquipmentGearActions(props)
  const gearSelectActions = useGearSelectActions()

  const handleSlotSizeChange = (value: number) => {
    if (value === maxSlotSize) {
      actions.setSlotSize(undefined)
    } else {
      actions.setSlotSize(value)
    }
  }

  const handleOpenGearSelect = () => {
    gearSelectActions.open(
      actions.create,
      canEquip && ((gear) => canEquip(equipmentKey, gear)),
      makeGetNextBonuses && makeGetNextBonuses(equipmentKey)
    )
  }

  return (
    <Flexbox className={className}>
      <SlotSizeButton current={currentSlotSize} max={maxSlotSize} onChange={handleSlotSizeChange} />
      {gear ? (
        <GearLabel
          gear={gear}
          equippable={canEquip && canEquip(equipmentKey, gear)}
          update={actions.update}
          onReselect={handleOpenGearSelect}
          onRemove={actions.remove}
        />
      ) : (
        <AddGearButton onClick={handleOpenGearSelect} />
      )}
    </Flexbox>
  )
}

export default React.memo(EquipmentListItem)
