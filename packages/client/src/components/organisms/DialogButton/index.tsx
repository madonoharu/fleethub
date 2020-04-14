import React from "react"
import styled from "styled-components"

import { Dialog as MuiDialog, DialogProps, makeStyles } from "@material-ui/core"

import { CloseButton } from "../../../components"
import { useOpen } from "../../../hooks"

const StyledCloseButton = styled(CloseButton)`
  position: absolute;
  top: -40px;
  right: -40px;
`

const useStyles = makeStyles({
  paper: {
    overflowY: "visible",
  },
})

type Props = {
  button: React.ReactElement
} & Omit<DialogProps, "open" | "onClose">

const DialogButton: React.FC<Props> = ({ children, button, ...rest }) => {
  const classes = useStyles()
  const { open, onOpen, onClose } = useOpen()

  const buttonProps = {
    onClick: onOpen,
  }

  return (
    <>
      {React.cloneElement(button, buttonProps)}
      <MuiDialog classes={classes} open={open} onClose={onClose} {...rest}>
        <StyledCloseButton onClick={onClose} />
        {children}
      </MuiDialog>
    </>
  )
}

export default DialogButton
