import {
  InputAdornment,
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
} from "@mui/material";
import React from "react";

export type InputProps = MuiTextFieldProps & {
  startLabel?: React.ReactNode;
};

const Input: React.FC<InputProps> = ({ startLabel, slotProps, ...rest }) => {
  const startAdornment = startLabel && (
    <InputAdornment position="start" className="[&_p]:text-[length:0.75rem] [&_p]:-mb-px">
      {startLabel}
    </InputAdornment>
  );

  return (
    <MuiTextField
      {...rest}
      slotProps={{
        ...slotProps,
        input: (ownerState) => ({
          startAdornment,
          ...(typeof slotProps?.input === "function"
            ? slotProps.input(ownerState)
            : slotProps?.input),
        }),
      }}
    />
  );
};

export default Input;
