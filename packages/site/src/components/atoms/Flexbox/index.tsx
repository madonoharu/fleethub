import { css } from "@emotion/react";
import styled, { CSSObject } from "@emotion/styled";

type FlexboxProps = Pick<
  CSSObject,
  "alignItems" | "justifyContent" | "flexDirection" | "flexWrap"
> & {
  gap?: number | undefined;
  mt?: number | undefined;
  mb?: number | undefined;
};

export default styled.div<FlexboxProps>(
  ({
    alignItems,
    justifyContent,
    flexDirection,
    flexWrap,
    gap,
    mt,
    mb,
    theme,
  }) => css`
    display: flex;
    align-items: ${alignItems || "center"};
    justify-content: ${justifyContent};
    flex-direction: ${flexDirection};
    flex-wrap: ${flexWrap};
    gap: ${gap && theme.spacing(gap)};
    margin-top: ${mt && theme.spacing(mt)};
    margin-bottom: ${mb && theme.spacing(mb)};
    > * {
      min-width: 0;
    }
  `
);
