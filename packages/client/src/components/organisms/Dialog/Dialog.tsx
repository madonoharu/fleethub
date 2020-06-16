import React from "react"
import styled, { css } from "styled-components"

import { Dialog as MuiDialog, DialogProps as MuiDialogProps } from "@material-ui/core"

import { CloseButton } from "../../../components"

const StyledCloseButton = styled(CloseButton)`
  position: absolute;
  top: 0px;
  right: 0px;
`

type ContainerProps = {
  fullHeight?: boolean
}

const Container: React.FCX<ContainerProps> = ({ fullHeight, ...divProps }) => <div {...divProps} />

const ScrollContainer = styled(Container)`
  max-width: 100%;
  max-height: 100%;
  overflow: scroll;

  ${(props) =>
    props.fullHeight &&
    css`
      height: calc(100vh - 64px);
    `}
`

export type DialogProps = Partial<MuiDialogProps> & {
  fullHeight?: boolean
}

const Dialog: React.FC<DialogProps> = ({ children, fullHeight, ...rest }) => (
  <MuiDialog open={false} {...rest}>
    <StyledCloseButton size="small" onClick={(event) => rest.onClose?.(event, "backdropClick")} />
    <ScrollContainer fullHeight={fullHeight}>{children}</ScrollContainer>
  </MuiDialog>
)

export default Dialog
