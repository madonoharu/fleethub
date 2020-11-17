import React from "react"
import { css } from "@emotion/react"
import styled from "@emotion/styled"

import SvgIcon from "@material-ui/core/SvgIcon"
import IconButton, { IconButtonProps } from "@material-ui/core/IconButton"
import Tooltip, { TooltipProps } from "@material-ui/core/Tooltip"

const smallStyle = css`
  font-size: 1.25rem;
  padding: 6px;
`

export interface WithIconButtonProps extends Omit<IconButtonProps, "size"> {
  label?: string
  title?: string
  size?: "tiny" | "small" | "medium"
  tooltipProps?: Omit<TooltipProps, "title">
}

const withIconButton = (WrappedIcon: React.FC) => {
  const WithIconButton: React.FC<WithIconButtonProps> = ({ title, label, tooltipProps, size, ...iconButonProps }) => {
    const WrappedButton = (
      <IconButton
        size={size === "tiny" || size === "small" ? "small" : undefined}
        css={size === "small" && smallStyle}
        {...iconButonProps}
      >
        <WrappedIcon css={{ fontSize: "inherit" }} />
        {label}
      </IconButton>
    )

    if (title && !iconButonProps.disabled) {
      return (
        <Tooltip title={title} {...tooltipProps}>
          {WrappedButton}
        </Tooltip>
      )
    }

    return WrappedButton
  }

  WithIconButton.displayName = `WithIconButton(${WrappedIcon.displayName || WrappedIcon.name})`

  return styled(WithIconButton)``
}

export default withIconButton
