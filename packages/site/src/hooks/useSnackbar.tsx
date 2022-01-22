import {
  Alert,
  AlertProps,
  Snackbar as MuiSnackbar,
  SnackbarProps as MuiSnackbarProps,
} from "@mui/material";
import React, { useCallback, useState } from "react";

type SnackbarProps = MuiSnackbarProps &
  Pick<AlertProps, "severity"> & {
    message?: React.ReactNode;
  };

const Snackbar: React.FC<SnackbarProps> = ({ severity, message, ...rest }) => (
  <MuiSnackbar {...rest}>
    <Alert variant="filled" severity={severity}>
      {message}
    </Alert>
  </MuiSnackbar>
);

export const useSnackbar = () => {
  const [state, setState] = useState<SnackbarProps>({});
  const show = useCallback(
    (props?: SnackbarProps) => setState({ open: true, ...props }),
    []
  );
  const hide = useCallback(() => setState({ open: false }), []);

  const Modal: React.FC<SnackbarProps> = useCallback(
    (props) => <Snackbar onClose={hide} {...state} {...props} />,
    [state, hide]
  );

  return Object.assign(Modal, {
    isOpen: state.open,
    show,
    hide,
  });
};
