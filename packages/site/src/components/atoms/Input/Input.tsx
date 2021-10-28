/** @jsxImportSource @emotion/react */
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

const Input: React.FC<InputProps> = ({ startLabel, InputProps, ...rest }) => {
  const startAdornment = startLabel && (
    <StartInputAdornment position="start">{startLabel}</StartInputAdornment>
  );

  const size = rest.variant === "outlined" ? "small" : undefined;
  const margin = rest.variant === "outlined" ? "dense" : undefined;

  return (
    <MuiTextField
      size={size}
      margin={margin}
      InputProps={{ startAdornment, ...InputProps }}
      {...rest}
    />
  );
};

export default Input;
