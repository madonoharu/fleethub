import { cn } from "../../../styles/cn";
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
  <div className={cn("flex items-center justify-between", className)}>
    <Typography
      className={cn("mr-2", classes?.label)}
      color="textSecondary"
      variant={variant}
      component="div"
    >
      {label}
    </Typography>
    <Typography className={classes?.value} variant={variant} component="div">
      {value}
    </Typography>
  </div>
);

export default LabeledValue;
