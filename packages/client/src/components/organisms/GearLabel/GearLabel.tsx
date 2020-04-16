import React from "react"
import styled from "styled-components"
import { Gear, GearState } from "@fleethub/core"

import {
  Flexbox,
  GearNameplate,
  GearStarsSelect,
  GearExpSelect,
  UpdateButton,
  ClearButton,
  GearTooltip,
} from "../../../components"

type Props = {
  className?: string
  style?: React.CSSProperties

  gear: Gear
  equippable?: boolean

  onRemove?: () => void
  onUpdate?: (changes: Partial<GearState>) => void
  onReselect?: () => void
}

export const GearLabel: React.FC<Props> = ({
  className,
  style,

  gear,
  equippable = true,

  onUpdate,
  onRemove,
  onReselect,
}) => {
  const { handleStarsChange, handleExpChange } = React.useMemo(
    () => ({
      handleStarsChange: (stars: number) => onUpdate && onUpdate({ stars }),
      handleExpChange: (exp: number) => onUpdate && onUpdate({ exp }),
    }),
    [onUpdate]
  )

  return (
    <Flexbox className={className} style={style}>
      <GearTooltip gear={gear}>
        <div>
          <GearNameplate size="small" equippable={equippable} iconId={gear.iconId} name={gear.name} />
        </div>
      </GearTooltip>

      <UpdateButton title="変更" size="small" onClick={onReselect} />
      <ClearButton title="削除" size="small" onClick={onRemove} />

      {gear.hasProficiency && <GearExpSelect exp={gear.exp} onChange={handleExpChange} />}
      <GearStarsSelect stars={gear.stars} onChange={handleStarsChange} />
    </Flexbox>
  )
}

const Styled = styled(GearLabel)`
  width: 100%;
  transition: 250ms;
  padding: 0 4px;

  > :not(:first-child) {
    flex-shrink: 0;
  }

  > :nth-child(4) {
    margin-left: auto;
  }

  ${UpdateButton}, ${ClearButton} {
    display: none;
  }

  :hover {
    background: ${(props) => props.theme.palette.action.hover};
    ${UpdateButton}, ${ClearButton} {
      display: block;
    }
    ${GearNameplate} p {
      display: none;
    }
  }
`

export default Styled
