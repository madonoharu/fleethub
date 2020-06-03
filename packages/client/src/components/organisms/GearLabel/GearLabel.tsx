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
import { Update } from "../../../utils"

type Props = {
  gear: Gear
  equippable?: boolean

  update?: Update<GearState>
  onRemove?: () => void
  onReselect?: () => void
}

const GearLabel: React.FCX<Props> = ({
  className,

  gear,
  equippable = true,

  update,
  onRemove,
  onReselect,
}) => {
  const { handleStarsChange, handleExpChange } = React.useMemo(() => {
    if (!update) return {}

    const handleStarsChange = (stars: number) =>
      update((draft) => {
        draft.stars = stars
      })

    const handleExpChange = (exp: number) =>
      update((draft) => {
        draft.exp = exp
      })

    return { handleStarsChange, handleExpChange }
  }, [update])

  return (
    <Flexbox className={className}>
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
    transition: 250ms;
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
