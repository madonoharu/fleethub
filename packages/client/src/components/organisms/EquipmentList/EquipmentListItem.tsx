import React from "react"
import { Gear, GearState, getSlotKey, EquipmentState, GearKey, GearBase, EquipmentBonuses } from "@fleethub/core"

import { Container, Paper, TextField, Button } from "@material-ui/core"

import { GearLabel, Flexbox } from "../../../components"
import { useGearSelectActions, useSwap } from "../../../hooks"
import { Update } from "../../../utils"

import SlotSizeButton from "./SlotSizeButton"
import AddGearButton from "./AddGearButton"

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
    const set = (gearState?: GearState) => {
      updateEquipment((draft) => {
        draft[gearKey] = gearState
      })
    }

    const slotKey = getSlotKey(gearKey)

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

    const setState = (recipe: (prev?: GearState) => GearState | undefined) => {
      updateEquipment((draft) => {
        draft[gearKey] = recipe(draft[gearKey])
      })
    }

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
  const gearSelectActions = useGearSelectActions()

  const [{ isDragging }, ref] = useSwap({
    type: "gear",
    state: gear && { gearId: gear.gearId, stars: gear.stars, exp: gear.exp },
    setState: actions.set,
    canDrag: Boolean(gear),
  })

  const handleSlotSizeChange = (value: number) => {
    if (value === maxSlotSize) {
      actions.setSlotSize(undefined)
    } else {
      actions.setSlotSize(value)
    }
  }

  const handleOpenGearSelect = () => {
    gearSelectActions.open(
      actions.set,
      canEquip && ((gear) => canEquip(gear, gearKey)),
      makeGetNextBonuses && makeGetNextBonuses(gearKey)
    )
  }

  return (
    <Flexbox ref={ref} className={className}>
      <SlotSizeButton current={currentSlotSize} max={maxSlotSize} onChange={handleSlotSizeChange} />
      {gear ? (
        <GearLabel
          gear={gear}
          equippable={canEquip?.(gear, gearKey)}
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
