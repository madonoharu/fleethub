import React, { useState, useCallback } from "react"

import { Dialog, DialogProps } from "../components"

export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const openModal = useCallback(() => setIsOpen(true), [setIsOpen])
  const closeModal = useCallback(() => setIsOpen(false), [setIsOpen])

  const Modal: React.FC<DialogProps> = useCallback(
    (props) => <Dialog open={isOpen} onClose={closeModal} {...props} />,
    [isOpen, closeModal]
  )

  return {
    isOpen,
    openModal,
    closeModal,
    Modal,
  }
}
