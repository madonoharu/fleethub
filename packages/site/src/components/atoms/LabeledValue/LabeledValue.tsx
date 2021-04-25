import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";

const Label = styled.div(
  ({ theme }) => css`
    color: ${theme.palette.text.secondary};
    font-size: 0.75rem;
    margin-right: 4px;
  `
);

const Value = styled.div(
  ({ theme }) => css`
    font-size: ${theme.typography.body2.fontSize};
  `
);

const LabeledValue: React.FCX<{
  label: React.ReactNode;
  value: React.ReactNode;
}> = ({ className, label, value }) => (
  <div className={className}>
    <Label>{label}</Label>
    <Value>{value}</Value>
  </div>
);

export default styled(LabeledValue)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
