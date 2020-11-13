import React from "react"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Gear, GearState } from "@fleethub/core"

import { Flexbox, GearStarsSelect, GearExpSelect, UpdateButton, ClearButton } from "../../../components"
import { Update } from "../../../utils"

import GearTooltip from "../GearTooltip"
import GearNameplate from "../GearNameplate"

const GearLabelAction = styled.div`
  display: flex;
  margin-left: auto;
`

type Props = {
  gear: Gear
  equippable?: boolean

  update?: Update<GearState>
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

      <UpdateButton css={styles.action} title="変更" size="small" onClick={onReselect} />
      <ClearButton css={styles.action} title="削除" size="small" onClick={onRemove} />

      <GearLabelAction>
        {gear.hasProficiency && <GearExpSelect exp={gear.exp} onChange={handleExpChange} />}
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
