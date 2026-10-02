import { cn } from "../../../styles/cn";
import { Button, ButtonProps } from "@mui/material";
import React from "react";

import { getDefaultOptionLabel, SelectComponent } from "../Select";

const SelectButtons: SelectComponent<{ buttonProps?: ButtonProps }> = (props) => {
  const {
    className,
    options,
    value,
    onChange,
    getOptionLabel = getDefaultOptionLabel,
    buttonProps,
  } = props;
  return (
    <div
      className={cn(
        "[&_button]:rounded-none [&_button]:box-border [&_button]:[border-block-end:2px_solid_transparent] [&_[aria-selected=true]]:[border-block-end-color:var(--color-primary)]",
        className,
      )}
    >
      {options.map((option, index) => (
        <Button
          key={index}
          aria-selected={option === value}
          onClick={() => onChange?.(option)}
          {...buttonProps}
        >
          {getOptionLabel(option)}
        </Button>
      ))}
    </div>
  );
};

export default SelectButtons;
