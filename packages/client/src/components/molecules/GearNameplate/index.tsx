import React from "react"
import styled, { css, CSSObject } from "styled-components"

import { Typography } from "@material-ui/core"

import { GearIcon } from "../../../components"

type Props = {
  name: string
  iconId: number
  size?: "small"
  equippable?: boolean
}

export const GearNameplate: React.FCX<Props> = ({ className, name, iconId, size, equippable = true }) => {
  return (
    <div className={className}>
      <GearIcon iconId={iconId} />
      <Typography variant="body2" color={equippable ? "initial" : "secondary"}>
        {name}
      </Typography>
    </div>
  )
}

const smallText = css`
  font-size: 0.75rem;
  line-height: 1.66;
`

export default styled(GearNameplate)`
  display: flex;
  align-items: center;
  max-width: 100%;

  p {
    overflow: hidden;
    white-space: nowrap;
    ${({ size, theme }) => size === "small" && smallText}
  }

  ${GearIcon} {
    flex-shrink: 0;
    margin-right: 4px;
  }
`
