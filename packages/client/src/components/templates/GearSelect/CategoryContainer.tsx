import React from "react"
import styled from "styled-components"
import { GearCategory } from "@fleethub/data"
import { GearBase } from "@fleethub/core"

import { Button } from "@material-ui/core"

import { GearNameplate } from "../../../components"

import CategoryDivider from "./CategoryDivider"

let GearButton: React.FCX<{ gear: GearBase; onClick?: () => void }> = ({ className, gear, onClick }) => {
  return (
    <Button className={className} onClick={onClick}>
      <GearNameplate name={gear.name} iconId={gear.iconId} />
    </Button>
  )
}

GearButton = styled(GearButton)`
  justify-content: flex-start;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
`

type Props = {
  category: GearCategory
  gears: GearBase[]
  onSelect?: (gearId: number) => void
}

const CategoryContainer: React.FCX<Props> = ({ className, category, gears, onSelect }) => {
  return (
    <div className={className}>
      <CategoryDivider category={category} />
      <Grid>
        {gears.map((gear) => (
          <GearButton key={`gear-${gear.gearId}`} gear={gear} onClick={() => onSelect && onSelect(gear.gearId)} />
        ))}
      </Grid>
    </div>
  )
}

export default styled(CategoryContainer)``
