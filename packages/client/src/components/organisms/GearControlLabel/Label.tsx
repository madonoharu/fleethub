import React from "react"
import styled from "styled-components"
import { Gear, GearState } from "@fleethub/kcsim"

import Typography from "@material-ui/core/Typography"

import { GearIcon, GearStarsSelect, GearExpSelect, UpdateButton, ClearButton } from "../../../components"

const Name = styled(Typography)`
  font-size: inherit;
  overflow: hidden;
  white-space: nowrap;
`

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

      <Name color={equippable ? "initial" : "secondary"}>{gear.name}</Name>
      <UpdateButton title="変更" size={size} tooltipProps={tooltipProps} onClick={onReselect} />
      <ClearButton title="削除" size={size} tooltipProps={tooltipProps} onClick={onRemove} />

      <GearExpSelect size={size} exp={gear.exp} onChange={handleExpChange} />
      <GearStarsSelect stars={gear.stars} onChange={handleStarsChange} />
    </div>
  )
}

const StyledComponent = styled(Component)`
  display: flex;
  align-items: center;
  width: 100%;
  transition: 250ms;

  font-size: 0.75rem;

  > :not(${Name}) {
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
    ${Name} {
      display: none;
    }
  }
`

export default StyledComponent
