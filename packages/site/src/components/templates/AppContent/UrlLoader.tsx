import { CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";

import { useFhCore, useAppDispatch, useBootstrapped } from "../../../hooks";
import { initApp } from "../../../store";

const UrlLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { masterData } = useFhCore();
  const [initialized, setInitialized] = useState(false);
  const dispatch = useAppDispatch();
  const bootstrapped = useBootstrapped();

  useEffect(() => {
    if (bootstrapped) {
      void dispatch(initApp(masterData)).then(() => setInitialized(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapped]);

  if (!initialized) {
    return <CircularProgress size={80} sx={{ m: 2 }} />;
  }

  return <>{children}</>;
};

export default UrlLoader;
