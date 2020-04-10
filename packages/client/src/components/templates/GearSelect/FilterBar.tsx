import React from "react"
import styled from "styled-components"
import { GearCategory } from "@fleethub/data"
import { GearBase } from "@fleethub/core"

import { AppBar, Toolbar, Checkbox, FormControlLabel, Box, Typography } from "@material-ui/core"

import { useGearSelect } from "../../../hooks"
import { Flexbox, SelectButtons, Select } from "../../../components"

import FilterButtons, { filterNameToFn } from "./FilterButtons"
import CategorySelect from "./CategorySelect"
import { defaultComparer, idComparer } from "./comparers"

const Right = styled(Flexbox)`
  margin-left: auto;
  margin-bottom: -2px;
`

const allCategories = Object.values(GearCategory).filter(
  (category): category is GearCategory => typeof category === "number"
)

const createCategoryGearMap = (gears: GearBase[]) => {
  const map = new Map<GearCategory, GearBase[]>()
  allCategories.forEach((category) => {
    const filtered = gears.filter((gear) => gear.category === category)
    if (filtered.length > 0) map.set(category, filtered)
  })

  return map
}

const getVisibleCategories = (gears: GearBase[]) => {
  const categories = [...new Set(gears.map((gear) => gear.category))]
  return categories.concat(0).sort((a, b) => a - b)
}

type Props = {
  gears: GearBase[]
  children: (entries: Array<[GearCategory, GearBase[]]>) => React.ReactNode
}

const FilterBar: React.FCX<Props> = ({ className, gears, children }) => {
  const { state, setState, equippableFilter } = useGearSelect()

  const handleFilterChange = (filter: string) => {
    setState({ filter, category: 0 })
  }

  const handleCategoryChange = (category: number) => {
    setState({ category })
  }

  const equippableGears = gears
    .filter((gear) => {
      if (state.abyssal) return gear.is("Abyssal")
      return !gear.is("Abyssal")
    })
    .filter(equippableFilter)

  const visibleGears = equippableGears.filter(filterNameToFn(state.filter)).sort(idComparer)

  const visibleCategories = getVisibleCategories(visibleGears)

  const categoryFilter = (gear: GearBase) => state.category === 0 || state.category === gear.category
  const entries = Array.from(createCategoryGearMap(visibleGears.filter(categoryFilter)))

  return (
    <>
      <div className={className}>
        <FilterButtons value={state.filter} onChange={handleFilterChange} equippableGears={equippableGears} />
        <CategorySelect value={state.category} options={visibleCategories} onChange={handleCategoryChange} />
        <Right>
          <Checkbox size="small" checked={state.abyssal} onClick={() => setState({ abyssal: !state.abyssal })} />
          <Typography variant="body2">深海</Typography>
        </Right>
      </div>
      {children(entries)}
    </>
  )
}

export default styled(FilterBar)`
  height: 40px;
  display: flex;
  align-items: center;

  ${CategorySelect} {
    margin-left: 8px;
  }
`
