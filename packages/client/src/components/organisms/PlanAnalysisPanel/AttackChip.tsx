import React from "react"
import styled, { css } from "styled-components"
import { DaySpecialAttack } from "@fleethub/core"

import { Chip } from "@material-ui/core"
import { orange } from "@material-ui/core/colors"

const dictionary: Record<DaySpecialAttack["type"], string> = {
  MainMain: "主主",
  MainApShell: "主徹",
  MainRader: "主電",
  MainSecond: "主副",
  DoubleAttack: "連撃",
  Zuiun: "瑞雲",
  Suisei: "海空",
  FBA: "FBA",
  BBA: "BBA",
  BA: "BA",
}

const AttackChip: React.FCX<{ attack: DaySpecialAttack }> = ({ className, attack }) => {
  return <Chip className={className} variant="outlined" size="small" label={dictionary[attack.type]} />
}

export default styled(AttackChip)`
  width: 48px;
  border-radius: 4px;
  ${(props) => css`
    border-color: ${props.theme.kc.palette.shelling};
    color: ${props.theme.kc.palette.shelling};
  `}
`
