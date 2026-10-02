import { createEmotionCache as createMuiEmotionCache } from "@mui/material-nextjs/v16-pagesRouter";

export function createEmotionCache() {
  return createMuiEmotionCache({
    key: "css",
    enableCssLayer: true,
  });
}

export { cn } from "./cn";

export * from "./theme";
export { default as ThemeProvider } from "./ThemeProvider";
export { getNodeTypeStyle } from "./nodeTypeStyle";
