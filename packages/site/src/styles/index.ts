import { css } from "@emotion/react";
import emotionStyled, { CreateStyled } from "@emotion/styled";

export const styled: CreateStyled = emotionStyled;
export { css };

export * from "./theme";
export { default as ThemeProvider } from "./ThemeProvider";
export { getNodeTypeStyle } from "./nodeTypeStyle";
