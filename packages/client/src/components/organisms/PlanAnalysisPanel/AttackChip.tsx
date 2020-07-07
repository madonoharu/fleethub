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
  border-color: ${(props) => props.theme.kc.palette.shelling};
  color: ${(props) => props.theme.kc.palette.shelling};
`

const nightStyle = css`
  min-width: 72px;
  border-color: ${(props) => props.theme.kc.palette.night};
  color: ${(props) => props.theme.kc.palette.night};
`

export default styled(AttackChip)`
  border-radius: 4px;

  ${(props) => (props.night ? nightStyle : dayStyle)}
`
