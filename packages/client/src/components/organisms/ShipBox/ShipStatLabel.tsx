import React from "react"
import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Text } from "../../atoms"
import { StatIcon } from "../../molecules"
import { withSign } from "../../../utils"
import { Flexbox } from "../../atoms"

import { ShipStatKey } from "./ShipStats"

const BonusText = styled(Text)(
  ({ theme }) => css`
    color: ${theme.colors.bonus};
    position: absolute;
    font-size: 10px;
    bottom: -3px;
    left: 10px;
  `
)
const DiffText = styled(Text)(
  ({ theme }) => css`
    color: ${theme.colors.diff};
    position: absolute;
    font-size: 10px;
    top: -3px;
    left: 10px;
  `
)

const ValueText = styled(Text)`
  margin-left: 4px;
  min-width: 24px;
  text-align: right;
  white-space: nowrap;
`

type Props = {
  statKey: ShipStatKey
  stat?: number
}

const ShipStatLabel: React.FCX<Props> = (props) => {
  const { className, statKey, stat } = props

  return (
    <Flexbox className={className}>
      <StatIcon icon={statKey} />
      <ValueText>{stat}</ValueText>
    </Flexbox>
  )
}

export default styled(ShipStatLabel)`
  position: relative;
  font-size: 0.75rem;
  line-height: 1.5;
` as typeof ShipStatLabel
