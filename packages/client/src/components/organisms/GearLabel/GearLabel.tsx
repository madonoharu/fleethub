import React from "react"
import styled from "styled-components"
import { Gear, GearState } from "@fleethub/core"

import { Flexbox, GearNameplate, GearStarsSelect, GearExpSelect, UpdateButton, ClearButton } from "../../../components"

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

  const size = "small"

  return (
    <Flexbox className={className} style={style}>
      <GearNameplate size="small" equippable={equippable} iconId={gear.iconId} name={gear.name} />
      <UpdateButton title="変更" size={size} onClick={onReselect} />
      <ClearButton title="削除" size={size} onClick={onRemove} />

      <GearExpSelect size={size} exp={gear.exp} onChange={handleExpChange} />
      <GearStarsSelect stars={gear.stars} onChange={handleStarsChange} />
    </Flexbox>
  )
}

const Styled = styled(GearLabel)`
  width: 100%;
  transition: 250ms;

  > :not(${GearNameplate}) {
    flex-shrink: 0;
    margin-right: 4px;
  }

  ${GearExpSelect} {
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
