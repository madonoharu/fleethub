import { nonNullable } from "@fh/utils";
import { Divider as MuiDivider, DividerProps, Typography } from "@mui/material";
import { cn } from "../../../styles/cn";
import React from "react";

type Props = Omit<DividerProps, "sx"> & {
  label?: React.ReactNode;
};

const Divider: React.FCX<Props> = ({ className, label, ...muiProps }) => {
  return (
    <div className={cn("flex w-full items-center", className)}>
      {nonNullable(label) && (
        <Typography variant="caption" color="textSecondary">
          {label}
        </Typography>
      )}
      <MuiDivider className="ml-2 grow" {...muiProps} />
    </div>
  );
};

export default Divider;
