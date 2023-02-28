import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormControlLabel,
  FormControlLabelProps,
} from "@mui/material";
import React from "react";

interface Props extends Pick<MuiCheckboxProps, "size" | "color" | "disabled"> {
  checked?: boolean;
  onChange?: (value: boolean) => void;
  label?: FormControlLabelProps["label"];
}

const Checkbox: React.FCX<Props> = ({
  className,
  checked,
  onChange,
  label,
  size,
  color,
  disabled,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  return (
    <FormControlLabel
      className={className}
      label={label}
      control={
        <MuiCheckbox
          size={size}
          color={color}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
        />
      }
    />
  );
};

export default Checkbox;
