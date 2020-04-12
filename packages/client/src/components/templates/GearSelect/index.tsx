import React from "react"
import styled from "styled-components"
import { fhSystem, GearBase } from "@fleethub/core"
import { GearCategory } from "@fleethub/data"

import { Button } from "@material-ui/core"

import { useGearSelect } from "../../../hooks"
import { GearIcon } from "../../../components"

import FilterBar from "./FilterBar"
import GearList from "./GearList"
import { getFilter } from "./filters"
import { idComparer } from "./comparers"

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

const getVisibleCategories = (gears: GearBase[]) => {
  const categories = [...new Set(gears.map((gear) => gear.category))]
  return categories.concat(0).sort((a, b) => a - b)
}

type Props = Pick<
  ReturnType<typeof useGearSelect>,
  "state" | "setState" | "onSelect" | "equippableFilter" | "getBonuses"
>

const GearSelect: React.FC<Props> = ({ state, setState, onSelect, equippableFilter = () => true, getBonuses }) => {
  const handleSelect = (gearId: number) => onSelect && onSelect({ gearId })

  const equippableGears = fhSystem.factory.masterGears
    .filter((gear) => {
      if (state.abyssal) return gear.is("Abyssal")
      return !gear.is("Abyssal")
    })
    .filter(equippableFilter)

  const visibleGears = equippableGears.filter(getFilter(state.filter)).sort(idComparer)

  const visibleCategories = getVisibleCategories(visibleGears)

  const categoryFilter = (gear: GearBase) => state.category === 0 || state.category === gear.category
  const entries = createCategoryGearEntries(visibleGears.filter(categoryFilter))

  return (
    <div>
      <FilterBar equippableGears={equippableGears} state={state} setState={setState} />
      <GearList entries={entries} onSelect={handleSelect} getBonuses={getBonuses} />
    </div>
  )
}

const Container: React.FC = () => {
  const props = useGearSelect()
  return <GearSelect {...props} />
}

export default Container
