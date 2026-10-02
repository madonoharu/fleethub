import styled from "@emotion/styled";
import { Typography, StyledComponentProps } from "@mui/material";
import { TypographyVariant } from "@mui/material/styles";
import React from "react";

type LabeledValueProps = StyledComponentProps<"label" | "value"> & {
  label: React.ReactNode;
  value: React.ReactNode;
  variant?: TypographyVariant | undefined;
};

const LabeledValue: React.FCX<LabeledValueProps> = ({
  className,
  classes,
  label,
  value,
  variant = "body2",
}) => (
  <div className={className}>
    <Typography
      className={classes?.label}
      color="textSecondary"
      variant={variant}
      component="div"
      sx={{
        mr: 1,
      }}
    >
      {label}
    </Typography>
    <Typography className={classes?.value} variant={variant} component="div">
      {value}
    </Typography>
  </div>
);

export default styled(LabeledValue)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
