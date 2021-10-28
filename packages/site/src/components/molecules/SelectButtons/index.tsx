/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button, ButtonProps } from "@mui/material";
import React from "react";

import { getDefaultOptionLabel, SelectComponent } from "../Select";

const SelectButtons: SelectComponent<{ buttonProps?: ButtonProps }> = (
  props
) => {
  const {
    className,
    options,
    value,
    onChange,
    getOptionLabel = getDefaultOptionLabel,
    buttonProps,
  } = props;
  return (
    <div className={className}>
      {options.map((option, index) => (
        <Button
          key={index}
          aria-selected={option === value}
          onClick={() => onChange?.(option)}
          {...buttonProps}
        >
          {getOptionLabel(option)}
        </Button>
      ))}
    </div>
  );
};

export default styled(SelectButtons)(
  ({ theme }) => css`
    button {
      border-radius: 0;
      box-sizing: border-box;
      border-block-end: solid 2px rgba(0, 0, 0, 0);
    }
    [aria-selected="true"] {
      border-block-end: solid 2px ${theme.palette.primary.main};
    }
  `
) as SelectComponent<{ buttonProps?: ButtonProps }>;
