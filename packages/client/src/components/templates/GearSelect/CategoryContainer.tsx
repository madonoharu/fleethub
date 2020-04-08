import React from "react"
import styled from "styled-components"
import { GearCategory, GearCategoryName } from "@fleethub/data"
import { kcsim, MasterGear } from "@fleethub/core"

import { Typography, Divider as MuiDivider, Button } from "@material-ui/core"

import { useGearSelect } from "../../../hooks"
import { GearNameplate, SelectButtons } from "../../../components"

let GearButton: React.FCX<{ gear: MasterGear; onClick?: () => void }> = ({ className, gear, onClick }) => {
  return (
    <Button className={className} onClick={onClick}>
      <GearNameplate name={gear.name} iconId={gear.iconId} />
    </Button>
  )
}

GearButton = styled(GearButton)`
  justify-content: flex-start;
`

const Divider = styled(MuiDivider)`
  flex-grow: 1;
  margin-left: 8px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
`

type Props = {
  category: GearCategory
  gears: MasterGear[]
  onSelect?: (id: number) => void
}

const CategoryContainer: React.FCX<Props> = ({ className, category, gears, onSelect }) => {
  const name = GearCategoryName[category]
  return (
    <div>
      <div className={className}>
        <Typography variant="caption" color="textSecondary">
          {name}
        </Typography>
        <Divider />
      </div>
      <Grid>
        {gears.map((gear) => (
          <GearButton key={`gear-${gear.id}`} gear={gear} onClick={() => onSelect && onSelect(gear.id)} />
        ))}
      </Grid>
    </div>
  )
}

export default styled(CategoryContainer)`
  display: flex;
  align-items: center;
  width: 100%;
`
