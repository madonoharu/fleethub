import React from "react"
import styled, { css } from "styled-components"

import { Typography } from "@material-ui/core"

import { GearIcon, Flexbox } from "../../../components"

type Props = {
  name: string
  iconId: number
  size?: "small"
  wrap?: boolean
  equippable?: boolean
}

export const GearNameplate: React.FCX<Props> = ({ className, name, iconId, size, equippable = true }) => {
  return (
    <Flexbox className={className}>
      <GearIcon iconId={iconId} />
      <Typography variant="body2" color={equippable ? "initial" : "secondary"}>
        {name}
      </Typography>
    </Flexbox>
  )
}

const smallText = css`
  font-size: 0.75rem;
  line-height: 1.66;
`

const noWrapCss = css`
  overflow: hidden;
  white-space: nowrap;
`

export default styled(GearNameplate)`
  p {
    ${({ wrap }) => !wrap && noWrapCss}
    ${({ size, theme }) => size === "small" && smallText}
  }

  ${GearIcon} {
    flex-shrink: 0;
    margin-right: 4px;
  }
`
