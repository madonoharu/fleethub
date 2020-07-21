import React from "react"
import styled, { css } from "styled-components"
import { DaySpecialAttack, NightSpecialAttack } from "@fleethub/core"

import { Chip } from "@material-ui/core"

type Props = {
  night?: boolean
  attack: DaySpecialAttack | NightSpecialAttack
}

const AttackChip: React.FCX<Props> = ({ className, attack }) => {
  return <Chip className={className} variant="outlined" size="small" label={attack.name} />
}

const dayStyle = css`
  min-width: 48px;
  border-color: ${(props) => props.theme.colors.shelling};
  color: ${(props) => props.theme.colors.shelling};
`

const nightStyle = css`
  min-width: 72px;
  border-color: ${(props) => props.theme.colors.night};
  color: ${(props) => props.theme.colors.night};
`

export default styled(AttackChip)`
  border-radius: 4px;

  ${(props) => (props.night ? nightStyle : dayStyle)}
`
