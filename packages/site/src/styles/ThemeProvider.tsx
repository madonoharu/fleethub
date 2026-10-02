import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import React from "react";

import { theme } from "./theme";

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </MuiThemeProvider>
);

export default ThemeProvider;
