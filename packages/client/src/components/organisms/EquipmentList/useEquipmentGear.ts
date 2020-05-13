import { useMemo } from "react"
import { GearState, EquipmentState, EquipmentGearKey, getEquipmentSlotKey } from "@fleethub/core"

import { useGearSelectActions, useFhSystem } from "../../../hooks"
import { Update } from "../../../utils"

export type EquipmentGearProps = {
  state?: GearState
  gearKey: EquipmentGearKey
  updateEquipment: Update<EquipmentState>
}

export const useEquipmentGear = ({ state, gearKey, updateEquipment }: EquipmentGearProps) => {
  const gearSelectActions = useGearSelectActions()
  const fhSystem = useFhSystem()

  const actions = useMemo(() => {
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

  const gear = state && fhSystem.createGear(state)

  return { gear, ...actions }
}
