import {
  Popover as MuiPopover,
  PopoverProps as MuiPopoverProps,
} from "@material-ui/core";
import React, { useCallback, useState } from "react";

type PopoverProps = Partial<MuiPopoverProps>;

export const usePopover = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const show = useCallback(
    (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
    []
  );
  const hide = useCallback(() => setAnchorEl(null), []);

  const Popover: React.FC<PopoverProps> = useCallback(
    (props) => (
      <MuiPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={hide}
        {...props}
      />
    ),
    [anchorEl, hide]
  );

  return Object.assign(Popover, {
    isOpen: Boolean(anchorEl),
    show,
    hide,
  });
};
