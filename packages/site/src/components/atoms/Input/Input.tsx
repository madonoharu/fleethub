import styled from "@emotion/styled";
import {
  InputAdornment,
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
} from "@mui/material";
import React from "react";

const StartInputAdornment = styled(InputAdornment)`
  p {
    font-size: 0.75rem;
    margin-bottom: -1px;
  }
`;

export type InputProps = MuiTextFieldProps & {
  startLabel?: React.ReactNode;
};

const Input: React.FC<InputProps> = ({ startLabel, slotProps, ...rest }) => {
  const startAdornment = startLabel && (
    <StartInputAdornment position="start">{startLabel}</StartInputAdornment>
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
