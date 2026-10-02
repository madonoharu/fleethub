import { Alert, AlertTitle, Typography } from "@mui/material";
import React from "react";

interface ErrorAlertProps {
  title?: string;
  error: unknown;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ title, error, className }) => {
  console.error(error);

  let message: string;

  if (error instanceof Error) {
    message = error.stack || String(error);
  } else {
    message = String(error);
  }
  return (
    <Alert severity="error" className={className}>
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <Typography variant="body2" className="block whitespace-pre-wrap">
        {message}
      </Typography>
    </Alert>
  );
};

export default ErrorAlert;
