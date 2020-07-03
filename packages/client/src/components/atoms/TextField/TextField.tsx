import React from "react"
import styled from "styled-components"

import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps, InputAdornment } from "@material-ui/core"

const StartInputAdornment = styled(InputAdornment)`
  p {
    font-size: 0.75rem;
    margin-bottom: -1px;
  }
`

export type TextFieldProps = MuiTextFieldProps & {
  startLabel?: React.ReactNode
}

const TextField: React.FC<TextFieldProps> = ({ startLabel, InputProps, ...rest }) => {
  const startAdornment = startLabel && <StartInputAdornment position="start">{startLabel}</StartInputAdornment>

  return <MuiTextField InputProps={{ startAdornment, ...InputProps }} {...rest} />
}

export default styled(TextField)`
  .MuiInputBase-root > * {
    flex-shrink: 0;
  }
`
