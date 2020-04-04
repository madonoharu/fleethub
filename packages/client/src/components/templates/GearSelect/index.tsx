import React from "react"
import styled from "styled-components"
import { gears, GearData, GearCategory } from "@fleethub/data"

import { Button, Checkbox } from "@material-ui/core"

import { useGearSelect } from "../../../hooks"
import { GearIcon } from "../../../components"

type Key = { [K in keyof GearData]-?: Required<GearData>[K] extends number ? K : never }[keyof GearData]

type Comparer = (left: GearData, right: GearData) => number
const createComparer = (keys: Key[]): Comparer => (left, right) => {
  for (const key of keys) {
    const value = (right[key] ?? 0) - (left[key] ?? 0)
    if (value === 0) continue
    return value
  }
  return 0
}

const GearButton: React.FCX<{ gear: GearData; onClick: () => void }> = ({ gear, onClick }) => {
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

const categories = Object.values(GearCategory).filter((value): value is number => typeof value === "number")

type Props = {
  onSelect?: (gearId: number) => void
}

const Component: React.FC<Props> = ({ onSelect }) => {
  const [category, setCategory] = React.useState(categories[0])
  const [isAbyssalMode, setIsAbyssalMode] = React.useState(false)
  const handleSelect: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(
    (event) => {
      onSelect && onSelect(Number(event.currentTarget.id))
    },
    [onSelect]
  )
  return (
    <>
      <Checkbox checked={isAbyssalMode} onClick={() => setIsAbyssalMode((value) => !value)} />
      {categories.map((category) => (
        <Button key={category} onClick={() => setCategory(category)}>
          {category}
        </Button>
      ))}
      <GearContiner>
        {gears
          .filter((gear) => gear.category === category)
          .filter((gear) => {
            if (isAbyssalMode) return gear.id > 500
            return gear.id < 500
          })
          .sort(createComparer(["firepower", "torpedo"]))
          .map((gear) => (
            <Button key={gear.id} id={gear.id.toString()} onClick={handleSelect}>
              <GearIcon iconId={gear.iconId} />
              {gear.name}
            </Button>
          ))}
      </GearContiner>
    </>
  )
}

const Container: React.FC = () => {
  const { onSelect } = useGearSelect()
  return <Component onSelect={onSelect} />
}

export default Container
