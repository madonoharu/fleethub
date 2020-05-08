import React from "react"
import styled from "styled-components"
import { GearCategory } from "@fleethub/data"

import { Checkbox, FormControlLabel } from "@material-ui/core"

import { Flexbox } from "../../../components"

import FilterButtons from "./FilterButtons"
import CategorySelect from "./CategorySelect"
import { GearSelectProps } from "./GearSelect"

const Right = styled(Flexbox)`
  margin-left: auto;
  margin-bottom: -2px;
`

type Props = {
  visibleCategories: GearCategory[]
  visibleFilterKeys: string[]

  abyssal: boolean
  filterKey: string
  category: number

  onUpdate: GearSelectProps["onUpdate"]
}

const FilterBar: React.FCX<Props> = ({
  className,
  visibleFilterKeys,
  visibleCategories,
  abyssal,
  filterKey,
  category,
  onUpdate,
}) => {
  const handleFilterChange = (filterKey: string) => onUpdate({ filterKey, category: 0 })

  const handleCategoryChange = (category: number) => onUpdate({ category })

  const toggleAbyssal = () => onUpdate({ abyssal: !abyssal })
  return (
    <>
      <div className={className}>
        <FilterButtons value={filterKey} options={visibleFilterKeys} onChange={handleFilterChange} />
        <CategorySelect value={category} options={visibleCategories} onChange={handleCategoryChange} />
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
