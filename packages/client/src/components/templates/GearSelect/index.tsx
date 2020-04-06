import React from "react"
import styled from "styled-components"
import { kcsimFactory, MasterGear } from "@fleethub/kcsim"

import { Button } from "@material-ui/core"

import { useGearSelect } from "../../../hooks"
import { GearIcon, SelectButtons } from "../../../components"

import FilterBar from "./FilterBar"
import GearList from "./GearList"

type Props = {
  onSelect?: (gearId: number) => void
}

const Component: React.FC<Props> = ({ onSelect }) => {
  return (
    <div style={{ margin: "0 8px" }}>
      <FilterBar gears={kcsimFactory.masterGears}>
        {(entries) => <GearList entries={entries} onSelect={onSelect} />}
      </FilterBar>
    </div>
  )
}

const Container: React.FC = () => {
  const { onSelect } = useGearSelect()
  return <Component onSelect={onSelect} />
}

export default Container
