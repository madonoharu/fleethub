import React from "react"
import styled from "styled-components"

import Typography from "@material-ui/core/Typography"

import { GearIcon, GearStarsSelect, GearExpSelect, UpdateButton, ClearButton, Flexbox } from "../../../components"
import { GearState } from "../../../store"

const Name = styled(Typography)`
  overflow: hidden;
  white-space: nowrap;
`

type Gear = {
  stars: number
  exp: number
  iconId: number
  name: string
  hasProficiency: boolean
}

type Props = {
  className?: string
  style?: React.CSSProperties

  gear: Gear
  equippable?: boolean

  onRemove?: () => void
  onUpdate?: (changes: Partial<GearState>) => void
  onReselect?: () => void
}

const tooltipProps = { placement: "top" } as const

export const Component: React.FC<Props> = ({
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
    <div className={className} style={style}>
      <GearIcon size="small" iconId={gear.iconId} />

      <Name variant="body2" color={equippable ? "initial" : "secondary"}>
        {gear.name}
      </Name>
      <UpdateButton title="変更" size={size} tooltipProps={tooltipProps} onClick={onReselect} />
      <ClearButton title="削除" size={size} tooltipProps={tooltipProps} onClick={onRemove} />

      {gear.hasProficiency && <GearExpSelect size={size} exp={gear.exp} onChange={handleExpChange} />}
      <GearStarsSelect stars={gear.stars} onChange={handleStarsChange} />
    </div>
  )
}

const StyledComponent = styled(Component)`
  display: flex;
  align-items: center;
  width: 100%;
  transition: 250ms;

  > :not(${Name}) {
    flex-shrink: 0;
    margin-right: 4px;
  }

  ${GearExpSelect} {
    margin-left: auto;
  }

  > button {
    display: none;
  }

  :hover {
    background: ${(props) => props.theme.palette.action.hover};
    > button {
      display: block;
    }
    ${Name} {
      display: none;
    }
  }
`

export default StyledComponent
