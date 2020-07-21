import React from "react"
import styled, { css } from "styled-components"
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

const hasBonus = ({ bonuses }: Props) => {
  if (!bonuses) return false
  return Object.values(bonuses).some((value) => value !== 0)
}

const bonusCss = css`
  box-sizing: border-box;
  border: ${({ theme }) => `1px solid ${theme.colors.bonus}`};
`

export default styled(GearButton)`
  justify-content: flex-start;
  height: 36px;
  ${(props) => hasBonus(props) && bonusCss}
`
