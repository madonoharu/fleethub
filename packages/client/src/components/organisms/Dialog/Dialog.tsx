import React from "react"
import styled, { css } from "styled-components"

import { Dialog as MuiDialog, DialogProps as MuiDialogProps } from "@material-ui/core"

import { CloseButton } from "../../../components"

const StyledCloseButton = styled(CloseButton)`
  position: absolute;
  top: 0px;
  right: 0px;
`

const ScrollContainer = styled.div`
  max-width: 100%;
  max-height: 100%;
  overflow-y: scroll;
`

export type DialogProps = Partial<MuiDialogProps> & {
  fullHeight?: boolean
}

const Dialog: React.FC<DialogProps> = ({ children, fullHeight, ...rest }) => (
  <MuiDialog open={false} transitionDuration={100} {...rest}>
    <StyledCloseButton size="small" onClick={(event) => rest.onClose?.(event, "backdropClick")} />
    <ScrollContainer>{children}</ScrollContainer>
  </MuiDialog>
)

export default styled(Dialog)`
  .MuiDialog-paper {
    ${(props) => props.theme.acrylic}
    ${(props) =>
      props.fullHeight &&
      css`
        height: calc(100vh - 64px);
      `}
  }
`
