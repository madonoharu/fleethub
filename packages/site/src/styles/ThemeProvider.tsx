import { css, Global } from "@emotion/react";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import React from "react";

import { theme, Theme } from "./theme";

const globalStyles = (theme: Theme) => css`
  :root {
    --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI",
      "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif,
      "Segoe UI Emoji", "Segoe UI Symbol";
  }

  body {
    background: #141e30;
    scrollbar-color: ${theme.colors.scrollbar} transparent;
    scrollbar-width: thin;
  }

  code {
    font-family: Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono",
      monospace;
    background-color: rgba(102, 178, 255, 0.15);
    direction: ltr;
    display: inline-block;
    font-size: 0.8125rem;
    line-height: 1.5;
    letter-spacing: 0px;
    padding: 0px 5px;
    border-radius: 5px;
  }

  ul {
    margin-block: 0;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.scrollbar};
  }
  ::-webkit-scrollbar-track,
  ::-webkit-scrollbar-corner {
    background: transparent;
  }

  .MuiPopover-paper,
  .MuiDialog-paper {
    ${theme.styles.acrylic}
  }

  .MuiTooltip-popper {
    will-change: auto !important;
  }
  .MuiTooltip-tooltip {
    font-size: ${theme.typography.body2.fontSize};
    ${theme.styles.darkAcrylic}
  }
`;

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Global styles={globalStyles} />
    {children}
  </MuiThemeProvider>
);

export default ThemeProvider;
