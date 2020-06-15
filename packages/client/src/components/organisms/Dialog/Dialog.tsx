import React from "react"
import styled from "styled-components"

import { Dialog as MuiDialog, DialogProps, withStyles } from "@material-ui/core"

import { CloseButton } from "../../../components"

const StyledCloseButton = styled(CloseButton)`
  position: absolute;
  top: -40px;
  right: -40px;
`

const StyledMuiDialog = withStyles({
  paper: {
    overflowY: "visible",
  },
})(MuiDialog)

const Dialog: React.FC<DialogProps> = ({ children, ...rest }) => (
  <StyledMuiDialog {...rest}>
    <StyledCloseButton onClick={(event) => rest.onClose?.(event, "backdropClick")} />
    {children}
  </StyledMuiDialog>
)

export default Dialog
