import { css } from "@emotion/react";
import styled, { CSSObject } from "@emotion/styled";

type FlexboxProps = Pick<
  CSSObject,
  "alignItems" | "justifyContent" | "flexDirection"
> & {
  gap?: number | undefined;
};

export default styled.div<FlexboxProps>(
  ({ alignItems, justifyContent, flexDirection, gap, theme }) => css`
    display: flex;
    align-items: ${alignItems || "center"};
    justify-content: ${justifyContent};
    flex-direction: ${flexDirection};
    gap: ${theme.spacing(gap || 0)};
    > * {
      min-width: 0;
      min-height: 0;
    }
  `
);
