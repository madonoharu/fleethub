import React from "react"
import styled from "styled-components"
import { GearBase } from "@fleethub/core"

import { SelectButtons } from "../../../components"

import FilterIcon from "./FilterIcon"
import { getVisibleFilterKeys } from "./filters"

const getFilterIcon = (key: string) => <FilterIcon icon={key} />

type Props = {
  value: string
  onChange: (value: string) => void
  equippableGears: GearBase[]
}

const GearFilterButtons: React.FCX<Props> = ({ className, value, onChange, equippableGears }) => {
  const options = getVisibleFilterKeys(equippableGears)
  return (
    <SelectButtons
      className={className}
      options={options}
      value={value}
      onChange={onChange}
      getOptionLabel={getFilterIcon}
    />
  )
}

export default styled(GearFilterButtons)`
  button {
    padding: 4px 0;
  }
`
