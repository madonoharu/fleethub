import React from "react"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Gear } from "@fleethub/sim"

import { Flexbox } from "../../atoms"
import { GearStarsSelect, GearExpSelect, UpdateButton, ClearButton } from "../../molecules"

import GearNameplate from "../GearNameplate"
import GearTooltip from "../GearTooltip"
import { GearState } from "../../../store"

const GearLabelAction = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`

type Props = {
  gear: Gear
  equippable?: boolean

  onUpdate?: (changes: Partial<GearState>) => void
  onRemove?: () => void
  onReselect?: () => void
}

const styles = {
  action: css`
    display: none;
  `,
  right: css`
    margin-left: auto;
  `,
}

const GearLabel: React.FCX<Props> = ({
  className,

  gear,
  equippable = true,

  onUpdate,
  onRemove,
  onReselect,
}) => {
  const hanldeExpChange = (exp: number) => {
    onUpdate?.({ exp })
  }

  const handleStarsChange = (stars: number) => {
    onUpdate?.({ stars })
  }

  return (
    <Flexbox className={className}>
      <GearTooltip gear={gear}>
        <div>
          <GearNameplate size="small" equippable={equippable} iconId={gear.icon_id} name={gear.name} />
        </div>
      </GearTooltip>

      <UpdateButton css={styles.action} title="変更" size="tiny" onClick={onReselect} />
      <ClearButton css={styles.action} title="削除" size="tiny" onClick={onRemove} />

      <GearLabelAction>
        <GearExpSelect exp={gear.exp} onChange={hanldeExpChange} />
        <GearStarsSelect stars={gear.stars} onChange={handleStarsChange} />
      </GearLabelAction>
    </Flexbox>
  )
}

const Styled = styled(GearLabel)(
  ({ theme }) => css`
    width: 100%;
    transition: 250ms;
    padding: 0 4px;

    > :not(div:first-of-type) {
      flex-shrink: 0;
    }

    :hover {
      background: ${theme.palette.action.hover};
      ${UpdateButton} {
        display: block;
      }
      ${GearNameplate} p {
        display: none;
      }
    }
  `
)

export default Styled
