import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormControlLabel,
} from "@material-ui/core";
import React from "react";

type CheckboxProps = {
  checked?: boolean;
  onChange?: (value: boolean) => void;
  label?: React.ReactNode;
} & Pick<MuiCheckboxProps, "size">;

const Checkbox: React.FCX<CheckboxProps> = ({
  className,
  checked,
  onChange,
  label,
  size,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    onChange?.(event.target.checked);

  const elem = (
    <MuiCheckbox size={size} checked={checked} onChange={handleChange} />
  );

  if (!label) return elem;

  return (
    <FormControlLabel className={className} label={label} control={elem} />
  );
};

export default Checkbox;
