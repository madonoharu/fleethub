import React, { useMemo } from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"
import { GearState, GearBase, EquipmentBonuses, Gear } from "@fleethub/core"

import { useFhSystem } from "../../../hooks"
import { gearListSlice, selectGearListState } from "../../../store"

import { getFilter, getVisibleGroups } from "./filters"
import { idComparer } from "./comparers"
import FilterBar from "./FilterBar"
import CategoryContainer from "./CategoryContainer"

const createCategoryGearEntries = (gears: GearBase[]) => {
  const map = new Map<number, GearBase[]>()

  const setGear = (gear: GearBase) => {
    const list = map.get(gear.category)
    if (list) {
      list.push(gear)
    } else {
      map.set(gear.category, [gear])
    }
  }

  gears.forEach(setGear)

  return Array.from(map.entries())
}

const getDefaultFilterKey = (keys: string[]) => {
  const found = ["mainGun", "torpedo", "landBased", "fighter"].find((key) => keys.includes(key))
  return found || keys[0] || "all"
}

type GearListProps = {
  canEquip?: (gear: GearBase) => boolean
  getBonuses?: (gear: GearBase) => EquipmentBonuses
  onSelect?: (gear: Gear) => void
}

const useGearListState = () => {
  const { masterGears: gears, createGear } = useFhSystem()

  const dispatch = useDispatch()
  const state = useSelector(selectGearListState)

  const actions = useMemo(() => {
    const update = (...args: Parameters<typeof gearListSlice.actions.update>) =>
      dispatch(gearListSlice.actions.update(...args))

    const setAbyssal = (abyssal: boolean) => update({ abyssal })
    const setGroup = (group: string) => update({ group })

    return { update, setAbyssal, setGroup }
  }, [dispatch])

  return { gears, ...state, createGear, actions }
}

const GearList: React.FC<GearListProps> = ({ canEquip, getBonuses, onSelect }) => {
  const { gears, abyssal, group, actions, createGear } = useGearListState()

  const handleSelect = (base: GearBase) => {
    if (!onSelect) return
    const state: GearState = { gearId: base.gearId }
    if (base.hasProficiency && !base.categoryIn("LbRecon")) {
      state.exp = 100
    }

    const gear = createGear(state)
    gear && onSelect(gear)
  }

  const { equippableGears, visibleGroups } = React.useMemo(() => {
    const equippableGears = gears.filter((gear) => {
      if (abyssal !== gear.is("Abyssal")) return false
      return !canEquip || canEquip(gear)
    })

    const visibleGroups = getVisibleGroups(equippableGears)

    return { equippableGears, visibleGroups }
  }, [gears, abyssal, canEquip])

  const currentGroup = visibleGroups.includes(group) ? group : getDefaultFilterKey(visibleGroups)
  const groupFilter = getFilter(currentGroup)

  const visibleGears = equippableGears.filter(groupFilter).sort(idComparer)

  const entries = createCategoryGearEntries(visibleGears)

  return (
    <div>
      <FilterBar
        visibleGroups={visibleGroups}
        abyssal={abyssal}
        group={currentGroup}
        onAbyssalChange={actions.setAbyssal}
        onGroupChange={actions.setGroup}
      />
      <CategoryContainer entries={entries} onSelect={handleSelect} getBonuses={getBonuses} />
    </div>
  )
}

export default GearList
