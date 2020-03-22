import { useCallback, useState } from "react"

export const usePopover = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const onOpen = useCallback((event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget), [setAnchorEl])
  const onClose = useCallback(() => setAnchorEl(null), [setAnchorEl])

  return {
    onOpen,
    anchorEl,
    open,
    onClose,
  }
}
