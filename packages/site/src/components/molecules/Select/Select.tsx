import { MenuItem } from "@mui/material";
import React, { useCallback } from "react";

import { Input, InputProps } from "../../atoms";

export const getDefaultOptionLabel = (option: unknown): string => {
  switch (typeof option) {
    case "number":
      return option.toString();
    case "string":
      return option;
    case "object": {
      if (!option) return "";

      const { label, name } = option as { [K in string]: unknown };

      if (typeof label === "string") return label;
      if (typeof name === "string") return name;
    }
  }
  return "";
};

export type SelectComponentProps<T> = {
  className?: string;
  options: readonly T[];
  value: T;
  onChange?: (option: T) => void;
  getOptionLabel?: (option: T) => React.ReactNode;
  itemFilter?: (option: T) => boolean;
};

export type SelectComponent<P = Record<string, unknown>> = {
  <T>(props: SelectComponentProps<T> & P): React.ReactElement;
};

export type SelectInputProps = Omit<
  InputProps,
  keyof SelectComponentProps<unknown>
>;

const Select: SelectComponent<SelectInputProps> = (props) => {
  const {
    options,
    value,
    onChange,
    getOptionLabel = getDefaultOptionLabel,
    variant,
    itemFilter,
    ...muiProps
  } = props;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      onChange?.(options[Number(event.target.value)]),
    [options, onChange]
  );

  const getSx = (option: typeof value) => {
    const visible = itemFilter ? itemFilter(option) : true;
    if (visible) return;
    return { display: "none" };
  };

  const index = options.indexOf(value);

  if (index < 0) {
    console.warn(props.label, options, value);
  }

  return (
    <Input
      value={index}
      variant={variant}
      onChange={handleChange}
      select
      {...muiProps}
    >
      {options.map((option, i) => (
        <MenuItem key={i} value={i} sx={getSx(option)}>
          {getOptionLabel(option)}
        </MenuItem>
      ))}
    </Input>
  );
};

export default Select;
