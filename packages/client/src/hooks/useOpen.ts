import { useState, useCallback } from "react"

export const useOpen = (initialOpen = false) => {
  const [open, setOpen] = useState(initialOpen)
  const onOpen = useCallback(() => setOpen(true), [setOpen])
  const onClose = useCallback(() => setOpen(false), [setOpen])
  return {
    open,
    onOpen,
    onClose,
  }
}
