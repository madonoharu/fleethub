import React from "react"
import styled from "styled-components"
import { GearState, GearBase, EquipmentBonuses } from "@fleethub/core"
import { GearCategory } from "@fleethub/data"

import FilterBar from "./FilterBar"
import GearList from "./GearList"
import { getFilter, getVisibleFilterKeys } from "./filters"
import { idComparer } from "./comparers"
import { useFhSystem } from "../../../hooks"

const getVisibleCategories = (gears: GearBase[]) => {
  const categories = [...new Set(gears.map((gear) => gear.category))]
  return categories.concat(0).sort((a, b) => a - b)
}

const allCategories = Object.values(GearCategory).filter(
  (category): category is GearCategory => typeof category === "number"
)

const createCategoryGearEntries = (gears: GearBase[]) => {
  const entries: Array<[GearCategory, GearBase[]]> = []

  allCategories.forEach((category) => {
    const filtered = gears.filter((gear) => gear.category === category)
    if (filtered.length > 0) entries.push([category, filtered])
  })

  return entries
}

const getDefaultFilterKey = (keys: string[]) => {
  const found = ["mainGun", "torpedo", "landBased", "fighter"].find((key) => keys.includes(key))
  return found || keys[0] || "all"
}

export type GearSelectState = {
  filterKey: string
  category: number
  abyssal: boolean

  onSelect?: (gear: GearState) => void
  canEquip?: (gear: GearBase) => boolean
  getBonuses?: (gear: GearBase) => EquipmentBonuses
}

export type GearSelectProps = {
  state: GearSelectState
  onUpdate: (changes: Partial<GearSelectState>) => void
}

const GearSelect: React.FC<GearSelectProps> = ({ state, onUpdate }) => {
  const gears = useFhSystem().masterGears
  const { onSelect, canEquip, abyssal } = state

  const handleSelect = (gearId: number) => onSelect && onSelect({ gearId })

  const { equippableGears, visibleFilterKeys } = React.useMemo(() => {
    const equippableGears = gears.filter((gear) => {
      if (abyssal !== gear.is("Abyssal")) return false

      if (!canEquip) return true

      return canEquip(gear)
    })

    const visibleFilterKeys = getVisibleFilterKeys(equippableGears)
    return { equippableGears, visibleFilterKeys }
  }, [gears, abyssal, canEquip])

  let filterKey = state.filterKey
  if (!visibleFilterKeys.includes(state.filterKey)) {
    filterKey = getDefaultFilterKey(visibleFilterKeys)
  }

  const visibleGears = equippableGears.filter(getFilter(filterKey)).sort(idComparer)
  const visibleCategories = getVisibleCategories(visibleGears)

  const categoryFilter = (gear: GearBase) => state.category === 0 || state.category === gear.category
  const entries = createCategoryGearEntries(visibleGears.filter(categoryFilter))

  return (
    <div>
      <FilterBar
        visibleCategories={visibleCategories}
        visibleFilterKeys={visibleFilterKeys}
        abyssal={abyssal}
        filterKey={filterKey}
        category={state.category}
        onUpdate={onUpdate}
      />
      <GearList entries={entries} onSelect={handleSelect} getBonuses={state.getBonuses} />
    </div>
  )
}

export default GearSelect
