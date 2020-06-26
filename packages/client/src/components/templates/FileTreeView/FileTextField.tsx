import React from "react"
import styled from "styled-components"

import { TextField, TextFieldProps, ClickAwayListener, ClickAwayListenerProps } from "@material-ui/core"

type FileTextFieldProps = Omit<TextFieldProps, "onChange"> & {
  value?: string
  onChange: (value: string) => void
  onClickAway: ClickAwayListenerProps["onClickAway"]
}

const FileTextField: React.FC<FileTextFieldProps> = ({ onClickAway, value = "", onChange, ...rest }) => {
  const [str, setStr] = React.useState(value)

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <TextField
        size="small"
        value={str}
        onClick={(e) => e.preventDefault()}
        onChange={(e) => setStr(e.currentTarget.value)}
        onBlur={() => onChange(str)}
        {...rest}
      />
    </ClickAwayListener>
  )
}

export default styled(FileTextField)`
  height: 24px;
  input {
    padding: 3px 0 2px;
  }
`
