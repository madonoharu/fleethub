import styled from "@emotion/styled";
import { Divider as MuiDivider, DividerProps, Typography } from "@mui/material";
import React from "react";

const StyledDivider = styled(MuiDivider)`
  flex-grow: 1;
  margin-left: 8px;
`;

type Props = DividerProps & {
  label: React.ReactNode;
};

const Divider: React.FCX<Props> = ({ className, label, ...muiProps }) => {
  return (
    <div className={className}>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <StyledDivider {...muiProps} />
    </div>
  );
};

export default styled(Divider)`
  display: flex;
  align-items: center;
  width: 100%;
`;
