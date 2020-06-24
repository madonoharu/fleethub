import React from "react"
import styled from "styled-components"
import { GearCategory, GearCategoryName } from "@fleethub/data"
import { GearBase } from "@fleethub/core"

import { Button, Tooltip } from "@material-ui/core"

import { GearNameplate, GearTooltip, Divider, StatIcon, Text, Flexbox } from "../../../components"
import { toStatEntries } from "../../organisms/GearTooltip/GearStatList"
import { StatKeyDictionary } from "../../../utils"

const Margin = styled(Flexbox)`
  margin-left: 8px;
  width: 36px;
  ${StatIcon} {
    margin-right: 4px;
  }
`

const StatList: React.FC<{ gear: GearBase }> = ({ gear }) => {
  const entries = toStatEntries(gear)
  return (
    <Margin>
      {entries.map(([key, value]) => (
        <Tooltip key={key} title={StatKeyDictionary[key]}>
          <Margin>
            <StatIcon icon={key} />
            <Text>{value}</Text>
          </Margin>
        </Tooltip>
      ))}
    </Margin>
  )
}

const Container = styled.div`
  display: flex;
  width: 100%;
  > * {
    width: 50%;
    max-width: 50%;
  }
`

let GearButton: React.FCX<{ gear: GearBase; onClick?: () => void }> = ({ className, gear, onClick }) => {
  return (
    <Button className={className} onClick={onClick}>
      <Container>
        <GearTooltip gear={gear}>
          <div>
            <GearNameplate name={gear.name} iconId={gear.iconId} />
          </div>
        </GearTooltip>
        <StatList gear={gear} />
      </Container>
    </Button>
  )
}

GearButton = styled(GearButton)`
  width: 100%;
  justify-content: flex-start;
`

type Props = {
  category: GearCategory
  gears: GearBase[]
  onSelect?: (gearId: number) => void
}

const CategoryContainer: React.FCX<Props> = ({ className, category, gears, onSelect }) => {
  return (
    <div className={className}>
      <Divider label={GearCategoryName[category]} />
      {gears.map((gear) => (
        <GearButton key={`gear-${gear.gearId}`} gear={gear} onClick={() => onSelect && onSelect(gear.gearId)} />
      ))}
    </div>
  )
}

export default styled(CategoryContainer)``
