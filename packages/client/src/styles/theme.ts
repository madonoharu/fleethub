import { createMuiTheme } from "@material-ui/core"
import { css } from "styled-components"

import { palette, colors } from "./colors"

const fontFamily = `
-apple-system, 
BlinkMacSystemFont,
"Segoe UI",
Roboto,
"Hiragino Sans",
"Noto Sans CJK JP",
"Original Yu Gothic",
"Yu Gothic",
sans-serif,
"Apple Color Emoji",
"Segoe UI Emoji",
"Segoe UI Symbol",
"Noto Sans Emoji"
`

const muiTheme = createMuiTheme({
  typography: {
    fontFamily,
  },
  palette,
  props: {
    MuiContainer: {
      maxWidth: "md",
    },
    MuiDialog: {
      maxWidth: "md",
    },

    MuiLink: {
      target: "_blank",
      rel: "noopener",
    },
    MuiTooltip: {
      placement: "top",
    },
    MuiSnackbar: {
      autoHideDuration: 5000,
      anchorOrigin: { vertical: "top", horizontal: "right" },
    },
    MuiTabs: {
      indicatorColor: "primary",
    },
    MuiCheckbox: {
      color: "primary",
    },
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          overflowY: "hidden",
        },

        "@font-face": [
          {
            fontFamily: "Original Yu Gothic",
            src: "local('Yu Gothic Medium')",
            fontWeight: 100,
          },
          {
            fontFamily: "Original Yu Gothic",
            src: "local('Yu Gothic Medium')",
            fontWeight: 200,
          },
          {
            fontFamily: "Original Yu Gothic",
            src: "local('Yu Gothic Medium')",
            fontWeight: 300,
          },
          {
            fontFamily: "Original Yu Gothic",
            src: "local('Yu Gothic Medium')",
            fontWeight: 400,
          },
          {
            fontFamily: "Original Yu Gothic",
            src: "local('Yu Gothic Bold')",
            fontWeight: "bold",
          },
        ],
      },
    },
    MuiButton: {
      root: {
        textTransform: "none",
        minWidth: 0,
        fontWeight: 400,
      },
    },
    MuiTab: {
      root: {
        textTransform: "none",
      },
    },
    MuiListItemIcon: {
      root: {
        minWidth: "auto",
        marginRight: 16,
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: "rgba(30, 30, 35)",
      },
    },
    MuiDrawer: {
      paper: {
        backgroundColor: "rgba(30, 30, 35)",
      },
    },
  },
})

const isFirefox = window.navigator.userAgent.includes("Firefox")

const acrylic = isFirefox
  ? css`
      background: rgba(60, 60, 70, 0.95);
    `
  : css`
      background: rgba(60, 60, 70, 0.6);
      backdrop-filter: blur(8px);
    `

const darkAcrylic = isFirefox
  ? css`
      background: rgba(30, 30, 35, 0.98);
    `
  : css`
      background: rgba(30, 30, 35, 0.85);
      backdrop-filter: blur(8px);
    `

const swappable = css`
  border-radius: 4px;

  &.droppable {
    box-shadow: 0px 0px 2px 2px ${colors.droppable};
  }

  &.dragging {
    opacity: 0.3;
  }
`

const styles = {
  acrylic,
  darkAcrylic,
  swappable,
}

const theme = { ...muiTheme, colors, styles }

export type Theme = typeof theme

export default theme
