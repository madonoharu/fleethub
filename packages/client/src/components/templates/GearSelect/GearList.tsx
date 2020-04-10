import React from "react"
import styled from "styled-components"
import { VariableSizeList, ListChildComponentProps } from "react-window"
import { GearBase } from "@fleethub/core"
import { GearCategory } from "@fleethub/data"

import { Button, Divider } from "@material-ui/core"

import CategoryContainer from "./CategoryContainer"

const List = styled(VariableSizeList)``

type Props = {
  entries: Array<[GearCategory, GearBase[]]>
  onSelect?: (gearId: number) => void
}

const GearList: React.FC<Props> = ({ entries, onSelect }) => {
  const columnCount = 2

  const ref = React.useRef<VariableSizeList>(null)

  const getItemSize = (index: number) => {
    const rowHeight = Math.ceil(entries[index][1].length / columnCount) * 36 + 19
    return rowHeight
  }
  const renderItem = ({ index, style }: ListChildComponentProps) => {
    const [category, gears] = entries[index]
    return (
      <div style={style}>
        <CategoryContainer category={category} gears={gears} onSelect={onSelect} />
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

const Sim: React.FC<Props> = ({ entries, onSelect }) => {
  return (
    <div>
      {entries.map(([category, gears]) => (
        <CategoryContainer key={category} category={category} gears={gears} onSelect={onSelect} />
      ))}
    </div>
  )
}

export default GearList
