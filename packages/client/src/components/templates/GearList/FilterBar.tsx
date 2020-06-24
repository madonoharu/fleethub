import React from "react"
import styled from "styled-components"
import { GearCategory } from "@fleethub/data"

import { Checkbox, FormControlLabel } from "@material-ui/core"

import { Flexbox } from "../../../components"
import { GearListState } from "../../../store"

import FilterButtons from "./FilterButtons"
import CategorySelect from "./CategorySelect"

const Right = styled(Flexbox)`
  margin-left: auto;
  margin-bottom: -2px;
`

type Props = Pick<GearListState, "abyssal" | "filterKey" | "category"> & {
  visibleCategories: GearCategory[]
  visibleFilterKeys: string[]

  onAbyssalChange: (next: GearListState["abyssal"]) => void
  onFilterChange: (next: GearListState["filterKey"]) => void
  onCategoryChange: (next: GearListState["category"]) => void
}

const FilterBar: React.FCX<Props> = ({
  className,
  visibleFilterKeys,
  visibleCategories,
  abyssal,
  filterKey,
  category,
  onAbyssalChange,
  onFilterChange,
  onCategoryChange,
}) => {
  const toggleAbyssal = () => onAbyssalChange(!abyssal)

  return (
    <>
      <div className={className}>
        <FilterButtons value={filterKey} options={visibleFilterKeys} onChange={onFilterChange} />
        <CategorySelect value={category} options={visibleCategories} onChange={onCategoryChange} />
        <Right>
          <FormControlLabel
            label="深海"
            control={<Checkbox size="small" checked={abyssal} onClick={toggleAbyssal} />}
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
