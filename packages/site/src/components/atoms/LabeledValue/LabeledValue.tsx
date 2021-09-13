import styled from "@emotion/styled";
import { Typography, StyledComponentProps } from "@mui/material";
import { Variant } from "@mui/material/styles/createTypography";
import React from "react";

type LabeledValueProps = StyledComponentProps<"label" | "value"> & {
  label: React.ReactNode;
  value: React.ReactNode;
  labelVariant?: Variant | undefined;
  valueVariant?: Variant | undefined;
};

const LabeledValue: React.FCX<LabeledValueProps> = ({
  className,
  classes,
  label,
  value,
  labelVariant = "body2",
  valueVariant = "body2",
}) => (
  <div className={className}>
    <Typography
      className={classes?.label}
      css={{ marginRight: 8 }}
      color="textSecondary"
      variant={labelVariant}
      component="div"
    >
      {label}
    </Typography>
    <Typography
      className={classes?.value}
      variant={valueVariant}
      component="div"
    >
      {value}
    </Typography>
  </div>
);

export default styled(LabeledValue)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
