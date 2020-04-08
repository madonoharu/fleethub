import React from "react"
import styled from "styled-components"
import { kcsim, GearState } from "@fleethub/core"

import { Button } from "@material-ui/core"

import { useGearSelect } from "../../../hooks"
import { GearIcon, SelectButtons } from "../../../components"

import FilterBar from "./FilterBar"
import GearList from "./GearList"

type Props = {
  onSelect?: (gear: GearState) => void
}

const Component: React.FC<Props> = ({ onSelect }) => {
  const handleSelect = (gearId: number) => onSelect && onSelect({ gearId })
  return (
    <div style={{ margin: "0 8px" }}>
      <FilterBar gears={kcsim.factory.masterGears}>
        {(entries) => <GearList entries={entries} onSelect={handleSelect} />}
      </FilterBar>
    </div>
  )
}

const Container: React.FC = () => {
  const { onSelect } = useGearSelect()
  return <Component onSelect={onSelect} />
}

export default Container
