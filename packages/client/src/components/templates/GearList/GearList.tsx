import React from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"
import { GearState, GearBase, EquipmentBonuses } from "@fleethub/core"
import { GearCategory } from "@fleethub/data"

import { useFhSystem } from "../../../hooks"
import { gearListSlice, selectGearListState } from "../../../store"

import { getFilter, getVisibleFilterKeys } from "./filters"
import { idComparer } from "./comparers"
import FilterBar from "./FilterBar"
import CategoryContainer from "./CategoryContainer"

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

type GearListProps = {
  canEquip?: (gear: GearBase) => boolean
  getBonuses?: (gear: GearBase) => EquipmentBonuses
  onSelect?: (gear: GearState) => void
}

const useGearListState = () => {
  const gears = useFhSystem().masterGears

  const dispatch = useDispatch()
  const state = useSelector(selectGearListState)

  const update = (...args: Parameters<typeof gearListSlice.actions.update>) =>
    dispatch(gearListSlice.actions.update(...args))

  return { gears, ...state, update }
}

const GearList: React.FC<GearListProps> = ({ canEquip, getBonuses, onSelect }) => {
  const { gears, abyssal, filterKey, category, update } = useGearListState()

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

  const currentFilterKey = visibleFilterKeys.includes(filterKey) ? filterKey : getDefaultFilterKey(visibleFilterKeys)
  const visibleGears = equippableGears.filter(getFilter(currentFilterKey)).sort(idComparer)
  const visibleCategories = getVisibleCategories(visibleGears)

  const categoryFilter = (gear: GearBase) => !category || category === gear.category
  const entries = createCategoryGearEntries(visibleGears.filter(categoryFilter))

  return (
    <div>
      <FilterBar
        visibleCategories={visibleCategories}
        visibleFilterKeys={visibleFilterKeys}
        abyssal={abyssal}
        filterKey={currentFilterKey}
        category={category}
        onAbyssalChange={(abyssal) => update({ abyssal })}
        onFilterChange={(filterKey) => update({ filterKey })}
        onCategoryChange={(category) => update({ category })}
      />
      <CategoryContainer entries={entries} onSelect={handleSelect} getBonuses={getBonuses} />
    </div>
  )
}

export default GearList
