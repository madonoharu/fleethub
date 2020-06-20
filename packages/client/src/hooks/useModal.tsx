import React, { useState, useCallback } from "react"

import { Dialog, DialogProps } from "../components"

export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const show = useCallback(() => setIsOpen(true), [])
  const hide = useCallback(() => setIsOpen(false), [])

  const Modal: React.FC<DialogProps> = useCallback((props) => <Dialog open={isOpen} onClose={hide} {...props} />, [
    isOpen,
    hide,
  ])

  return Object.assign(Modal, {
    isOpen,
    show,
    hide,
  })
}
