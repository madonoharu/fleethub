import React, { useState, useEffect, useRef, useMemo } from "react"
import styled from "styled-components"

import { useForkRef } from "@material-ui/core"

import { Input, InputProps } from "../../atoms"
import { ClearButton } from "../../molecules"

type TextFieldPropsBase = {
  onChange?: (value: string) => void
}

type TextFieldProps = Omit<InputProps, keyof TextFieldPropsBase> & TextFieldPropsBase

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  const { className, value = "", onChange, onBlur, ...rest } = props

  const [str, setStr] = useState(value)

  const inputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (str !== value) setStr(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const memoizedProps = useMemo(() => {
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setStr(event.currentTarget.value)
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.keyCode === 13) inputRef.current?.blur()
    }

    const handleClear = () => {
      setStr("")
      inputRef.current?.focus()
    }

    const InputProps = { endAdornment: <ClearButton size="small" onClick={handleClear} /> }

    return { onChange, onKeyDown, InputProps }
  }, [])

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(event)
    const current = event.currentTarget.value
    if (current !== value) onChange?.(current)
  }

  const handleRef = useForkRef(inputRef, ref)

  return (
    <Input inputRef={handleRef} className={className} value={str} onBlur={handleBlur} {...memoizedProps} {...rest} />
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
