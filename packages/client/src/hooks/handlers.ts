import { useState, useEffect, useCallback } from "react"

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

export const useSelect = <T>(options: readonly T[], defaultOption: T = options[0]) => {
  const [value, onChange] = useState(defaultOption)

  useEffect(() => {
    if (!options.includes(value)) {
      onChange(defaultOption)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, onChange])

  useEffect(() => onChange(defaultOption), [defaultOption])

  return { options, value, onChange }
}
