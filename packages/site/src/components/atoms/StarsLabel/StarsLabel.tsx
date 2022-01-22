import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";

type StarsLabelProps = {
  stars: number;
  disabled?: boolean;
};

const StarsLabel: React.FCX<StarsLabelProps> = ({ stars, ...rest }) => {
  return (
    <span {...rest}>
      <span>★</span>
      <span>{stars === 10 ? "M" : stars}</span>
    </span>
  );
};

export default styled(StarsLabel)(
  ({ theme, disabled }) => css`
    display: flex;
    justify-content: flex-start;
    color: ${disabled ? theme.palette.action.disabled : theme.colors.stars};
    width: 28px;
    > * {
      flex-basis: 100%;
    }
  `
);
