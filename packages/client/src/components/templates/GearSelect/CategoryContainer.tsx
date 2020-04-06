import React from "react"
import styled from "styled-components"
import { GearCategory, GearCategoryName } from "@fleethub/data"
import { kcsimFactory, MasterGear } from "@fleethub/kcsim"

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
  width: 400px;
  justify-content: flex-start;
  overflow: hidden;
  white-space: nowrap;
`

const Divider = styled(MuiDivider)`
  flex-grow: 1;
  margin-left: 8px;
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
      {gears.map((gear) => (
        <GearButton key={`gear-${gear.id}`} gear={gear} onClick={() => onSelect && onSelect(gear.id)} />
      ))}
    </div>
  )
}

export default styled(CategoryContainer)`
  display: flex;
  align-items: center;
  width: 100%;
`
