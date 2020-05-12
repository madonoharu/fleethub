import { useMemo } from "react"
import { GearState, EquipmentState, EquipmentKey } from "@fleethub/core"

import { useGearSelectActions, useFhSystem } from "../../../hooks"
import { Update } from "../../../utils"

export type EquipmentGearProps = {
  state?: GearState
  equipmentKey: EquipmentKey
  updateEquipment: Update<EquipmentState>
}

export const useEquipmentGear = ({ state, equipmentKey: key, updateEquipment }: EquipmentGearProps) => {
  const gearSelectActions = useGearSelectActions()
  const fhSystem = useFhSystem()

  const actions = useMemo(() => {
    const createGear = (gearState: GearState) => {
      updateEquipment((draft) => {
        if (!draft.gears) {
          draft.gears = {}
        }
        draft.gears[key] = gearState
      })
    }

    const openGearSelect = () => {
      gearSelectActions.update({
        onSelect: createGear,
      })
    }

    const changeSlotSize = (next: number) => {
      updateEquipment((draft) => {
        if (!draft.slots) {
          draft.slots = {}
        }
        draft.slots[key] = next
      })
    }

    const updateGear: Update<GearState> = (updater) =>
      updateEquipment((draft) => {
        const gearState = draft.gears?.[key]
        gearState && updater(gearState)
      })

    const remove = () => {
      updateEquipment((draft) => {
        delete draft.gears?.[key]
      })
    }

    return { openGearSelect, updateGear, changeSlotSize, remove }
  }, [key, updateEquipment, gearSelectActions])

  const gear = state && fhSystem.createGear(state)

  return { gear, ...actions }
}
