import React from "react"
import styled from "@emotion/styled"

import { Checkbox, FormControlLabel } from "@material-ui/core"

import { GearListState } from "../../../store"

import { Flexbox } from "../../atoms"

import FilterButtons from "./FilterButtons"

const Right = styled(Flexbox)`
  margin-left: auto;
  margin-bottom: -2px;
`

type Props = Pick<GearListState, "abyssal" | "group"> & {
  visibleGroups: string[]

  onAbyssalChange: (next: GearListState["abyssal"]) => void
  onGroupChange: (next: GearListState["group"]) => void
}

const FilterBar: React.FCX<Props> = ({ className, visibleGroups, abyssal, group, onAbyssalChange, onGroupChange }) => {
  const toggleAbyssal = () => onAbyssalChange(!abyssal)

  return (
    <>
      <div className={className}>
        <FilterButtons value={group} options={visibleGroups} onChange={onGroupChange} />
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
`
