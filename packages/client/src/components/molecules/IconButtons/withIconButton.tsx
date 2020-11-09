import React from "react"
import styled from "@emotion/styled"

import SvgIcon from "@material-ui/core/SvgIcon"
import IconButton, { IconButtonProps } from "@material-ui/core/IconButton"
import Tooltip, { TooltipProps } from "@material-ui/core/Tooltip"

export interface WithIconButtonProps extends IconButtonProps {
  label?: string
  title?: string
  tooltipProps?: Omit<TooltipProps, "title">
}

const withIconButton = (WrappedIcon: React.FC) => {
  const WithIconButton: React.FC<WithIconButtonProps> = ({ title, label, tooltipProps, ...iconButonProps }) => {
    const WrappedButton = (
      <IconButton {...iconButonProps}>
        <WrappedIcon />
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
  return styled(WithIconButton)`
    svg {
      font-size: inherit;
    }
  `
}

export default withIconButton
