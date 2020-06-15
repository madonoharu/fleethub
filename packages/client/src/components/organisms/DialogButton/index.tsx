import React from "react"

import { DialogProps } from "@material-ui/core"

import { Dialog } from "../../../components"
import { useOpen } from "../../../hooks"

type Props = {
  button: React.ReactElement
} & Omit<DialogProps, "open" | "onClose">

const DialogButton: React.FC<Props> = ({ children, button, ...rest }) => {
  const { open, onOpen, onClose } = useOpen()

  const buttonProps = {
    onClick: onOpen,
  }

  return (
    <>
      {React.cloneElement(button, buttonProps)}
      <Dialog open={open} onClose={onClose} {...rest} />
    </>
  )
}

export default DialogButton
