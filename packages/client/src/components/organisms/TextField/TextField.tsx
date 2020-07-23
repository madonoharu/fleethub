import React, { useState, useEffect, useRef } from "react"

import { Input, InputProps } from "../../atoms"
import { ClearButton } from "../../molecules"
import styled from "styled-components"

type TextFieldPropsBase = {
  onChange?: (value: string) => void
}

type TextFieldProps = Omit<InputProps, keyof TextFieldPropsBase> & TextFieldPropsBase

const TextField: React.FCX<TextFieldProps> = ({ className, value, onChange, onBlur, ...rest }) => {
  const [str, setStr] = useState(value)

  const inputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (str !== value) setStr(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStr(event.currentTarget.value)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(event)
    onChange?.(event.currentTarget.value)
  }

  const handleClear = () => {
    setStr("")
    inputRef.current?.focus()
  }

  return (
    <Input
      inputRef={inputRef}
      className={className}
      value={str}
      onChange={handleChange}
      onBlur={handleBlur}
      InputProps={{ endAdornment: <ClearButton size="small" onClick={handleClear} /> }}
      {...rest}
    ></Input>
  )
}

export default styled(TextField)`
  ${ClearButton} {
    visibility: hidden;
  }

  :hover ${ClearButton} {
    visibility: visible;
  }
`
