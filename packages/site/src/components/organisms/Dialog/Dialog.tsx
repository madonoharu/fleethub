import { Dialog as MuiDialog, DialogProps as MuiDialogProps } from "@mui/material";
import { mergeSlotProps } from "@mui/material/utils";
import React from "react";

import { CloseButton } from "../../molecules";
import { cn } from "../../../styles";

export type DialogProps = Partial<MuiDialogProps> & {
  full?: boolean;
  fullHeight?: boolean;
};

const Dialog: React.FC<DialogProps> = ({
  children,
  full,
  fullHeight,
  className,
  slotProps,
  ...rest
}) => (
  <MuiDialog
    className={className}
    slotProps={{
      ...slotProps,
      paper: mergeSlotProps(slotProps?.paper, {
        className: cn("p-2", (full || fullHeight) && "h-[calc(100vh-64px)]"),
      }),
    }}
    open={false}
    transitionDuration={100}
    fullWidth={full}
    {...rest}
  >
    <CloseButton
      className="absolute top-0 right-0 z-10"
      size="tiny"
      onClick={(event) => rest.onClose?.(event, "backdropClick")}
    />
    <div className="pl-0.5 overflow-y-scroll">{children}</div>
  </MuiDialog>
);

export default Dialog;
