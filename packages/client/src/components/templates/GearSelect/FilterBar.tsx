import React from "react"
import styled from "styled-components"
import { GearCategory, GearCategoryName } from "@fleethub/data"
import { kcsimFactory, MasterGear } from "@fleethub/kcsim"

import { AppBar, Toolbar, Checkbox } from "@material-ui/core"

import { useGearSelect } from "../../../hooks"
import { Flexbox, SelectButtons } from "../../../components"

import FilterButtons, { nameToFilterFn } from "./FilterButtons"
import { defaultComparer } from "./comparers"

const getCategoryName = (category: number) => {
  const name = GearCategoryName[category]
  if (!name) return "不明"
  return name
}

const allCategories = Object.values(GearCategory).filter(
  (category): category is GearCategory => typeof category === "number"
)

const createCategoryGearMap = (gears: MasterGear[]) => {
  const map = new Map<GearCategory, MasterGear[]>()
  allCategories.forEach((category) => {
    const filtered = gears.filter((gear) => gear.category === category)
    if (filtered.length > 0) map.set(category, filtered)
  })

  return map
}

const categoryToName = (category: number) => {
  if (!category) return "All"
  return getCategoryName(category)
}

const getVisibleCategories = (gears: MasterGear[]) => {
  const categories = [...new Set(gears.map((gear) => gear.category))]
  if (categories.length <= 1) return [0]
  return categories.concat(0).sort((a, b) => a - b)
}

type Props = {
  gears: MasterGear[]
  children: (entries: Array<[GearCategory, MasterGear[]]>) => React.ReactNode
}

const FilterBar: React.FC<Props> = ({ gears, children }) => {
  const { state, setState } = useGearSelect()

  const [selectedCategory, setSelectedCategory] = React.useState(0)
  const [isAbyssalMode, setIsAbyssalMode] = React.useState(false)

  const handleFilterChange = (filter: string) => {
    setState({ filter })
    setSelectedCategory(0)
  }

  const visibleGears = gears
    .filter(nameToFilterFn(state.filter))
    .filter((gear) => {
      if (state.abyssal) return gear.is("Abyssal")
      return !gear.is("Abyssal")
    })
    .sort(defaultComparer)

  const visibleCategories = getVisibleCategories(visibleGears)

  const categoryFilter = (gear: MasterGear) => selectedCategory === 0 || selectedCategory === gear.category
  const entries = Array.from(createCategoryGearMap(visibleGears.filter(categoryFilter)))

  return (
    <>
      <div>
        <Flexbox>
          <FilterButtons value={state.filter} onChange={handleFilterChange} />
          <Checkbox checked={state.abyssal} onClick={() => setState({ abyssal: !state.abyssal })} />
        </Flexbox>
        <SelectButtons
          value={selectedCategory}
          options={visibleCategories}
          onChange={(category) => setSelectedCategory(category)}
          getOptionLabel={categoryToName}
          buttonProps={{ size: "small" }}
        />
      </div>
      <div>{children(entries)}</div>
    </>
  )
}

export default FilterBar
