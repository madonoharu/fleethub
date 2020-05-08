import React from "react"
import styled from "styled-components"
import { VariableSizeList, ListChildComponentProps } from "react-window"
import { GearBase, EquipmentBonuses } from "@fleethub/core"
import { GearCategory, GearCategoryName } from "@fleethub/data"

import { Divider } from "../../../components"

import GearButton from "./GearButton"

const List = styled(VariableSizeList)``

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`

type Props = {
  entries: Array<[GearCategory, GearBase[]]>
  onSelect?: (gearId: number) => void
  getBonuses?: (gear: GearBase) => EquipmentBonuses
}

const NormalGearList: React.FC<Props> = ({ entries, onSelect, getBonuses }) => {
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
                onClick={() => onSelect && onSelect(gear.gearId)}
                bonuses={getBonuses && getBonuses(gear)}
              />
            ))}
          </Grid>
        </div>
      ))}
    </>
  )
}

const GearList: React.FC<Props> = ({ entries, onSelect, getBonuses }) => {
  const columnCount = 4

  const ref = React.useRef<VariableSizeList>(null)

  const getItemSize = (index: number) => {
    const rowHeight = Math.ceil(entries[index][1].length / columnCount) * 36 + 19
    return rowHeight
  }
  const renderItem = ({ index, style }: ListChildComponentProps) => {
    const [category, gears] = entries[index]
    return (
      <div style={style}>
        <Divider label={GearCategoryName[category]} />
        <Grid>
          {gears.map((gear) => (
            <GearButton
              key={`gear-${gear.gearId}`}
              gear={gear}
              onClick={() => onSelect && onSelect(gear.gearId)}
              bonuses={getBonuses && getBonuses(gear)}
            />
          ))}
        </Grid>
      </div>
    )
  }

  React.useEffect(() => {
    entries.forEach((_, index) => ref.current?.resetAfterIndex(index, true))
    ref.current?.scrollTo(0)
  }, [entries, ref])

  return (
    <List
      ref={ref}
      itemKey={(index) => `category-${entries[index][0]}`}
      height={640}
      itemCount={entries.length}
      itemSize={getItemSize}
      width={900}
    >
      {renderItem}
    </List>
  )
}

export default NormalGearList
