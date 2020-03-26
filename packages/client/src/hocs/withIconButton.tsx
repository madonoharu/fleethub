import React from "react"
import styled from "styled-components"

import SvgIcon from "@material-ui/core/SvgIcon"
import IconButton, { IconButtonProps } from "@material-ui/core/IconButton"
import Tooltip, { TooltipProps } from "@material-ui/core/Tooltip"

export interface WithIconButtonProps extends IconButtonProps {
  label?: string
  title?: string
  tooltipProps?: Partial<TooltipProps>
}

const withIconButton = (WrappedIcon: typeof SvgIcon & React.FC) => {
  const WithIconButton: React.FC<WithIconButtonProps> = ({ title, label, tooltipProps, ...iconButonProps }) => {
    const WrappedButton = (
      <IconButton {...iconButonProps}>
        <WrappedIcon fontSize="inherit" />
        {label}
      </IconButton>
    )

    if (title || (tooltipProps && tooltipProps.title)) {
      return (
        <Tooltip title={title} {...tooltipProps}>
          {WrappedButton}
        </Tooltip>
      )
    }
    return WrappedButton
  }

  WithIconButton.displayName = `WithIconButton(${WrappedIcon.name || WrappedIcon.displayName})`
  return styled(WithIconButton)``
}

export default withIconButton
