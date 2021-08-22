import { css } from "@emotion/react";
import styled, { CSSObject } from "@emotion/styled";
import React from "react";

type FlexboxProps = Pick<CSSObject, "alignItems"> & {
  gap?: number | undefined;
};

export default styled.div<FlexboxProps>(
  ({ alignItems, gap, theme }) => css`
    display: flex;
    align-items: ${alignItems || "center"};
    gap: ${theme.spacing(gap || 0)};
    > * {
      min-width: 0;
      min-height: 0;
    }
  `
);
