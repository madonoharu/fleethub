import React from "react"
import styled from "@emotion/styled"
import { GearBase, EquipmentBonuses } from "@fleethub/core"
import { GearCategory, GearCategoryName } from "@fleethub/data"

import { Typography } from "@material-ui/core"

import { Divider } from "../../../components"

import GearButton from "./GearButton"

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`

type Props = {
  searchValue: string
  gears: GearBase[]
  onSelect?: (gear: GearBase) => void
  getBonuses?: (gear: GearBase) => EquipmentBonuses
}

const GearSearchResult: React.FC<Props> = ({ searchValue, gears, onSelect, getBonuses }) => {
  const text = (
    <Typography>
      &quot;{searchValue}&quot;の検索結果 {gears.length === 0 && "見つかりませんでした"}
    </Typography>
  )
  return (
    <div>
      {text}
      <Grid>
        {gears.map((gear) => (
          <GearButton
            key={`gear-${gear.gearId}`}
            gear={gear}
            onClick={() => onSelect && onSelect(gear)}
            bonuses={getBonuses && getBonuses(gear)}
          />
        ))}
      </Grid>
    </div>
  )
}

export default GearSearchResult
