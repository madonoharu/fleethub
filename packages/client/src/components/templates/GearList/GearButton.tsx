import React from "react"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { GearBase, EquipmentBonuses } from "@fleethub/core"

import { Button } from "@material-ui/core"

import { GearNameplate, GearTooltip } from "../../../components"

type Props = {
  gear: GearBase
  onClick?: () => void
  bonuses?: EquipmentBonuses
}

const GearButton: React.FCX<Props> = ({ className, gear, onClick, bonuses }) => {
  return (
    <GearTooltip gear={gear} bonuses={bonuses} enterDelay={300} enterNextDelay={300}>
      <Button className={className} onClick={onClick}>
        <GearNameplate name={gear.name} iconId={gear.iconId} />
      </Button>
    </GearTooltip>
  )
}

const hasBonus = (bonuses?: EquipmentBonuses) => bonuses && Object.values(bonuses).some((value) => value !== 0)

export default styled(GearButton)(
  ({ theme, bonuses }) => css`
    justify-content: flex-start;
    height: 36px;
    ${hasBonus(bonuses) &&
    css`
      box-sizing: border-box;
      border: 1px solid ${theme.colors.bonus};
    `}
  `
)
