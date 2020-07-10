import React from "react"
import styled from "styled-components"

import { Button, ButtonProps } from "@material-ui/core"

import { SelectComponent, getDefaultOptionLabel } from "../Select"

const SelectButtons: SelectComponent<{ buttonProps?: ButtonProps }> = (props) => {
  const { className, options, value, onChange, getOptionLabel = getDefaultOptionLabel, buttonProps } = props
  return (
    <div className={className}>
      {options.map((option, index) => (
        <Button key={index} aria-selected={option === value} onClick={() => onChange(option)} {...buttonProps}>
          {getOptionLabel(option)}
        </Button>
      ))}
    </div>
  )
}

export default styled(SelectButtons)`
  button {
    border-radius: 0;
    box-sizing: border-box;
    border-block-end: solid 2px rgba(0, 0, 0, 0);
  }
  [aria-selected="true"] {
    border-block-end: solid 2px ${({ theme }) => theme.palette.primary.main};
  }
` as SelectComponent<{ buttonProps?: ButtonProps }>
