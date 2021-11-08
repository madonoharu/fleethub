/** @jsxImportSource @emotion/react */
import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormControlLabel,
  FormControlLabelProps,
} from "@mui/material";
import React from "react";

type CheckboxProps = {
  checked?: boolean;
  onChange?: (value: boolean) => void;
  label?: FormControlLabelProps["label"];
} & Pick<MuiCheckboxProps, "size" | "color">;

const Checkbox: React.FCX<CheckboxProps> = ({
  className,
  checked,
  onChange,
  label,
  size,
  color,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    onChange?.(event.target.checked);

  const elem = (
    <MuiCheckbox
      size={size}
      color={color}
      checked={checked}
      onChange={handleChange}
    />
  );

  if (!label) return elem;

  return (
    <FormControlLabel className={className} label={label} control={elem} />
  );
};

export default Checkbox;
