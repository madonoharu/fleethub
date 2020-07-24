import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"

import { useForkRef } from "@material-ui/core"

import { Input, InputProps } from "../../atoms"
import { ClearButton } from "../../molecules"

type TextFieldPropsBase = {
  onChange?: (value: string) => void
}

type TextFieldProps = Omit<InputProps, keyof TextFieldPropsBase> & TextFieldPropsBase

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  const { className, value, onChange, onBlur, ...rest } = props

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

  const handleRef = useForkRef(inputRef, ref)

  return (
    <Input
      inputRef={handleRef}
      className={className}
      value={str}
      onChange={handleChange}
      onBlur={handleBlur}
      InputProps={{ endAdornment: <ClearButton size="small" onClick={handleClear} /> }}
      {...rest}
    />
  )
})

export default styled(TextField)`
  ${ClearButton} {
    visibility: hidden;
  }

  :hover ${ClearButton} {
    visibility: visible;
  }
`
