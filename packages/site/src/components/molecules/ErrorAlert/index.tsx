import { Alert, AlertTitle, SxProps } from "@mui/material";
import React from "react";

interface ErrorAlertProps {
  title: string;
  error: unknown;
  sx?: SxProps;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ title, error, sx }) => {
  console.error(error);

  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error);
  }
  return (
    <Alert severity="error" sx={sx}>
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorAlert;
