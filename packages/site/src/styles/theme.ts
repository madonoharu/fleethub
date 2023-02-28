import { css } from "@emotion/react";
import { createTheme } from "@mui/material/styles";

import { colors, palette } from "./colors";

const muiTheme = createTheme({
  typography: {
    fontFamily: "var(--font-body)",
  },
  palette,
  components: {
    MuiTypography: {
      defaultProps: {
        variant: "body2",
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: "lg",
      },
    },
    MuiDialog: {
      defaultProps: {
        maxWidth: "lg",
      },
    },

    MuiLink: {
      defaultProps: {
        target: "_blank",
        rel: "noreferrer",
        color: "primary.light",
      },
    },
    MuiTooltip: {
      defaultProps: {
        placement: "top",
        disableInteractive: true,
      },
      styleOverrides: {
        tooltip: {
          fontSize: "0.875rem",
          background: "rgba(30, 20, 20, 0.85)",
          backdropFilter: "blur(8px)",
        },
      },
    },
    MuiTable: {
      defaultProps: {
        size: "small",
      },
    },
    MuiSnackbar: {
      defaultProps: {
        autoHideDuration: 5000,
        anchorOrigin: { vertical: "top", horizontal: "right" },
      },
    },
    MuiCheckbox: {
      defaultProps: {
        color: "primary",
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiButton: {
      defaultProps: {
        color: "inherit",
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          minWidth: 0,
          fontWeight: 400,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: palette.primary.light,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          "&.Mui-selected": {
            color: palette.primary.light,
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: "auto",
          marginRight: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "rgba(30, 30, 35)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "rgba(30, 30, 35)",
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        transitionDuration: 200,
      },
    },
    MuiAlert: {
      defaultProps: {
        variant: "outlined",
      },
    },
  },
});

const acrylic = css`
  background: rgba(60, 60, 70, 0.95) !important;

  @supports (backdrop-filter: blur(8px)) {
    background: rgba(60, 60, 70, 0.6) !important;
    backdrop-filter: blur(8px);
  }
`;

const darkAcrylic = css`
  background: rgba(30, 30, 35, 0.98);

  @supports (backdrop-filter: blur(8px)) {
    background: rgba(30, 30, 35, 0.85) !important;
    backdrop-filter: blur(8px);
  }
`;

const swappable = css`
  border-radius: 4px;
  cursor: grab;

  img {
    pointer-events: none;
  }

  &.droppable {
    box-shadow: 0px 0px 2px 2px ${colors.droppable};
  }

  &.dragging {
    opacity: 0.3;
  }
`;

const styles = {
  acrylic,
  darkAcrylic,
  swappable,
};

export const theme = { ...muiTheme, colors, styles };

export type Theme = typeof theme;
export type ThemeStyles = typeof styles;
