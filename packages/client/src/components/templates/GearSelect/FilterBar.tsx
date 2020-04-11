import React from "react"
import styled from "styled-components"
import { GearCategory } from "@fleethub/data"
import { GearBase } from "@fleethub/core"

import { AppBar, Toolbar, Checkbox, FormControlLabel, Box, Typography } from "@material-ui/core"

import { GearSelectState } from "../../../store"
import { Flexbox, SelectButtons, Select } from "../../../components"

import FilterButtons from "./FilterButtons"
import CategorySelect from "./CategorySelect"
import { getFilter } from "./filters"
import { defaultComparer, idComparer } from "./comparers"

const Right = styled(Flexbox)`
  margin-left: auto;
  margin-bottom: -2px;
`

const getVisibleCategories = (gears: GearBase[]) => {
  const categories = [...new Set(gears.map((gear) => gear.category))]
  return categories.concat(0).sort((a, b) => a - b)
}

type Props = {
  equippableGears: GearBase[]
  state: GearSelectState
  setState: (state: Partial<GearSelectState>) => void
}

const FilterBar: React.FCX<Props> = ({ className, equippableGears, state, setState }) => {
  const handleFilterChange = (filter: string) => setState({ filter, category: 0 })

  const handleCategoryChange = (category: number) => setState({ category })

  const toggleAbyssal = () => setState({ abyssal: !state.abyssal })

  const visibleGears = equippableGears.filter(getFilter(state.filter)).sort(idComparer)

  const visibleCategories = getVisibleCategories(visibleGears)

  return (
    <>
      <div className={className}>
        <FilterButtons value={state.filter} onChange={handleFilterChange} equippableGears={equippableGears} />
        <CategorySelect value={state.category} options={visibleCategories} onChange={handleCategoryChange} />
        <Right>
          <FormControlLabel
            label="深海"
            control={<Checkbox size="small" checked={state.abyssal} onClick={toggleAbyssal} />}
          />
        </Right>
      </div>
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
