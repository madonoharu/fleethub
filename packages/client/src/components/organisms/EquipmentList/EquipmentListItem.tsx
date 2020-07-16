import React from "react"
import { Gear, GearState, getSlotKey, EquipmentState, GearKey, GearBase, EquipmentBonuses } from "@fleethub/core"

import { GearLabel, GearList } from "../../../components"
import { useModal } from "../../../hooks"
import { Update } from "../../../utils"

import SlotSizeButton from "./SlotSizeButton"
import AddGearButton from "./AddGearButton"
import Swappable from "../Swappable"
import styled from "styled-components"

export type Props = {
  gear?: Gear
  currentSlotSize?: number
  maxSlotSize?: number

  gearKey: GearKey
  updateEquipment: Update<EquipmentState>

  canEquip?: (gear: GearBase, key?: GearKey) => boolean
  makeGetNextBonuses?: (key: GearKey) => (gear: GearBase) => EquipmentBonuses
}

const useEquipmentGearActions = ({ gearKey, updateEquipment }: Props) => {
  return React.useMemo(() => {
    const slotKey = getSlotKey(gearKey)

    const set = (gearState?: GearState) => {
      updateEquipment((draft) => {
        draft[gearKey] = gearState
      })
    }

    const setSlotSize = (next: number | undefined) => {
      updateEquipment((draft) => {
        if (next === undefined) {
          delete draft[slotKey]
        } else {
          draft[slotKey] = next
        }
      })
    }

    const update: Update<GearState> = (recipe) =>
      updateEquipment((draft) => {
        const state = draft[gearKey]
        state && recipe(state)
      })

    const remove = () => {
      updateEquipment((draft) => {
        delete draft[gearKey]
      })
    }

    return { set, update, remove, setSlotSize }
  }, [gearKey, updateEquipment])
}

const EquipmentListItem: React.FCX<Props> = (props) => {
  const { className, gearKey, gear, currentSlotSize, maxSlotSize, canEquip, makeGetNextBonuses } = props

  const actions = useEquipmentGearActions(props)
  const Modal = useModal()

  const handleGearSelect = (gear: GearState) => {
    actions.set(gear)
    Modal.hide()
  }

  const handleSlotSizeChange = (value: number) => {
    if (value === maxSlotSize) {
      actions.setSlotSize(undefined)
    } else {
      actions.setSlotSize(value)
    }
  }

  return (
    <Swappable className={className} type="gear" state={gear?.state} setState={actions.set} canDrag={Boolean(gear)}>
      <SlotSizeButton current={currentSlotSize} max={maxSlotSize} onChange={handleSlotSizeChange} />
      {gear ? (
        <GearLabel
          gear={gear}
          equippable={canEquip?.(gear, gearKey)}
          update={actions.update}
          onReselect={Modal.show}
          onRemove={actions.remove}
        />
      ) : (
        <AddGearButton onClick={Modal.show} />
      )}

      <Modal full>
        <GearList
          onSelect={handleGearSelect}
          canEquip={canEquip && ((gear) => canEquip(gear, gearKey))}
          getBonuses={makeGetNextBonuses && makeGetNextBonuses(gearKey)}
        />
      </Modal>
    </Swappable>
  )
}

const Styled = styled(EquipmentListItem)`
  display: flex;
`

export default React.memo(Styled)
