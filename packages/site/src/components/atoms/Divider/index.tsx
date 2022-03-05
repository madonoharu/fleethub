import { nonNullable } from "@fh/utils";
import { Divider as MuiDivider, DividerProps, Typography } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";

const StyledDivider = styled(MuiDivider)`
  flex-grow: 1;
  margin-left: 8px;
`;

type Props = Omit<DividerProps, "sx"> & {
  label?: React.ReactNode;
};

const Divider: React.FCX<Props> = ({ className, label, ...muiProps }) => {
  return (
    <div className={className}>
      {nonNullable(label) && (
        <Typography variant="caption" color="textSecondary">
          {label}
        </Typography>
      )}
      <StyledDivider {...muiProps} />
    </div>
  );
};

export default styled(Divider)`
  display: flex;
  align-items: center;
  width: 100%;
`;
