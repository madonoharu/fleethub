import React, { useState, useCallback } from "react"

import { Popover as MuiPopover, PopoverProps as MuiPopoverProps } from "@material-ui/core"

type PopoverProps = Partial<MuiPopoverProps>

export const usePopover = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openPopover = useCallback((event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget), [
    setAnchorEl,
  ])
  const closePopover = useCallback(() => setAnchorEl(null), [setAnchorEl])

  const Popover: React.FC<PopoverProps> = useCallback(
    (props) => <MuiPopover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={closePopover} {...props} />,
    [anchorEl, closePopover]
  )

  return {
    isOpen: Boolean(anchorEl),
    openPopover,
    closePopover,
    Popover,
  }
}
