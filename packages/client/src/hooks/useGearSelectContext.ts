import React from "react"
import constate from "constate"
import { GearState, GearBase, EquipmentBonuses } from "@fleethub/core"

export type GearSelectState = {
  filterKey: string
  category: number
  abyssal: boolean

  onSelect?: (gear: GearState) => void
  canEquip?: (gear: GearBase) => boolean
  getBonuses?: (gear: GearBase) => EquipmentBonuses
}

const initialState: GearSelectState = {
  abyssal: false,
  filterKey: "mainGun",
  category: 0,
}

export const useGearSelectState = () => {
  const [state, setState] = React.useState<GearSelectState>(initialState)

  const actions = React.useMemo(() => {
    const update = (changes: Partial<GearSelectState>) => setState((state) => ({ ...state, ...changes }))

    const close = () => update({ onSelect: undefined, canEquip: undefined, getBonuses: undefined })

    const open = (
      create: (state: GearState) => void,
      canEquip?: GearSelectState["canEquip"],
      getBonuses?: GearSelectState["getBonuses"]
    ) => {
      const onSelect: GearSelectState["onSelect"] = (state) => {
        create(state)
        close()
      }

      update({ onSelect, canEquip, getBonuses })
    }

    return { update, close, open, setState }
  }, [setState])

  return { state, actions }
}

const [GearSelectProvider, useGearSelectContext, useGearSelectActions] = constate(
  useGearSelectState,
  (context) => context,
  ({ actions }) => actions
)

export { GearSelectProvider, useGearSelectContext, useGearSelectActions }
