import { Alert, AlertTitle, SxProps, Typography } from "@mui/material";
import React from "react";

interface ErrorAlertProps {
  title?: string;
  error: unknown;
  sx?: SxProps;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ title, error, sx }) => {
  console.error(error);

  let message: string;

  if (error instanceof Error) {
    message = error.stack || String(error);
  } else {
    message = String(error);
  }
  return (
    <Alert severity="error" sx={sx}>
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <Typography variant="body2" display="block" whiteSpace="pre-wrap">
        {message}
      </Typography>
    </Alert>
  );
};

export default ErrorAlert;
