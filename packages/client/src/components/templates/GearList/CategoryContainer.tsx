import React from "react"
import styled from "@emotion/styled"
import { GearBase, EquipmentBonuses } from "@fleethub/core"
import { GearCategory, GearCategoryName } from "@fleethub/data"

import { Divider } from "../../../components"

import GearButton from "./GearButton"

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`

type Props = {
  entries: Array<[GearCategory, GearBase[]]>
  onSelect?: (gear: GearBase) => void
  getBonuses?: (gear: GearBase) => EquipmentBonuses
}

const CategoryContainer: React.FC<Props> = ({ entries, onSelect, getBonuses }) => {
  return (
    <>
      {entries.map(([category, gears]) => (
        <div key={`category-${category}`}>
          <Divider label={GearCategoryName[category]} />
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
      ))}
    </>
  )
}

export default CategoryContainer
