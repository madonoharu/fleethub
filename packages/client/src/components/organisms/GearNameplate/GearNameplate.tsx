import React from "react"
import { css } from "@emotion/react"

import { Typography } from "@material-ui/core"

import { GearIcon, Flexbox } from "../../../components"
import styled from "@emotion/styled"
import { useTranslation } from "react-i18next"

type Props = {
  className?: string
  name: string
  iconId: number
  size?: "small"
  wrap?: boolean
  equippable?: boolean
}

export const GearNameplate = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { className, name, iconId, wrap, equippable = true } = props
  const { t } = useTranslation("gears")
  return (
    <Flexbox ref={ref} className={className}>
      <GearIcon iconId={iconId} />
      <Typography variant="body2" align="left" noWrap={!wrap} color={equippable ? "initial" : "secondary"}>
        {t(name)}
      </Typography>
    </Flexbox>
  )
})

const smallText = css`
  font-size: 0.75rem;
  line-height: 1.66;
`

export default styled(GearNameplate)(
  ({ size }) => css`
    max-width: 100%;

    ${GearIcon} {
      flex-shrink: 0;
      margin-right: 4px;
    }

    p {
      max-width: calc(100% - 28px);
      ${size === "small" && smallText}
    }
  `
)
