import React from "react"
import styled from "styled-components"
import { kcsimFactory, MasterGear } from "@fleethub/kcsim"

import { Button, Divider, Container as MuiContainer } from "@material-ui/core"

import { useGearSelect } from "../../../hooks"
import { GearIcon, SelectButtons } from "../../../components"

import FilterBar from "./FilterBar"

const GearButton: React.FCX<{ gear: MasterGear; onClick: () => void }> = ({ gear, onClick }) => {
  return (
    <Button onClick={onClick}>
      <GearIcon iconId={gear.iconId} />
      {gear.name}
    </Button>
  )
}

const GearContiner = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));

  button {
    justify-content: flex-start;
  }
`

type Props = {
  onSelect?: (gearId: number) => void
}

const Component: React.FC<Props> = ({ onSelect }) => {
  const handleSelect: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(
    (event) => {
      onSelect && onSelect(Number(event.currentTarget.id))
    },
    [onSelect]
  )

  return (
    <div style={{ width: 960, padding: 8 }}>
      <FilterBar gears={kcsimFactory.masterGears}>
        {(entries) =>
          entries.map(([category, gears]) => {
            return (
              <div key={`category-${category}`}>
                <Divider />
                <GearContiner>
                  {gears.map((gear) => (
                    <Button key={gear.id} id={gear.id.toString()} onClick={handleSelect}>
                      <GearIcon iconId={gear.iconId} />
                      {gear.name}
                    </Button>
                  ))}
                </GearContiner>
              </div>
            )
          })
        }
      </FilterBar>
    </div>
  )
}

const Container: React.FC = () => {
  const { onSelect } = useGearSelect()
  return <Component onSelect={onSelect} />
}

export default Container
