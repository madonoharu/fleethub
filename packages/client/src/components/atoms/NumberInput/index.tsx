import React, { useState, useEffect, useCallback, useMemo } from "react"
import { round } from "lodash-es"
import styled from "styled-components"

import TextField, { TextFieldProps } from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import MuiButton from "@material-ui/core/Button"
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp"
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown"

import usePress from "./usePress"

const Button = styled(MuiButton)`
  display: block;
  padding: 0;
  width: 24px;
  height: 16px;
  line-height: 1;
`
const inputLabelProps = { style: { whiteSpace: "nowrap" } } as const

const stepValue = (value: number, step: number) => {
  const precision = Math.ceil(-Math.log10(Math.abs(step)))
  return round(value + step, precision)
}

type AdornmentProps = {
  increase: () => void
  decrease: () => void
}

const Adornment: React.FCX<AdornmentProps> = ({ className, increase, decrease }) => {
  const increaseProps = usePress(increase)
  const decreaseProps = usePress(decrease)

  return (
    <InputAdornment className={className} position="end">
      <div>
        <Button size="small" variant="text" {...increaseProps}>
          <ArrowDropUpIcon fontSize="inherit" />
        </Button>
        <Button size="small" variant="text" {...decreaseProps}>
          <ArrowDropDownIcon fontSize="inherit" />
        </Button>
      </div>
    </InputAdornment>
  )
}

const StyledAdornment = styled(Adornment)`
  visibility: hidden;
`

const toHalf = (str: string) => str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))

const isNumeric = (str: string) => {
  if (str === "") return false

  const num = Number(str)
  return Number.isFinite(num)
}

type NumberInputProps = {
  value: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
} & Omit<TextFieldProps, "type" | "inputProps" | "onChange" | "onInput">

const NumberInput: React.FC<NumberInputProps> = ({
  className,
  value,
  onChange,
  min,
  max,
  step = 1,
  variant,
  ...textFieldProps
}) => {
  const changeValue = useCallback(
    (next: number) => {
      if (!onChange) return

      next = typeof min === "number" ? Math.max(next, min) : next
      next = typeof max === "number" ? Math.min(next, max) : next

      onChange(next)
    },
    [min, max, onChange]
  )

  const [isFocused, setIsFocused] = useState(false)
  const handleFocus = React.useCallback(() => setIsFocused(true), [setIsFocused])
  const handleBlur = React.useCallback(() => setIsFocused(false), [setIsFocused])

  const [inputStr, setInputStr] = React.useState(value.toString())

  useEffect(() => {
    if (!isFocused) setInputStr(value.toString())
  }, [value, isFocused, setInputStr])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const str = event.target.value
      setInputStr(str)

      const next = Number(str)
      if (isNumeric(str)) {
        changeValue(next)
      }
    },
    [changeValue, setInputStr]
  )

  const InputProps = useMemo(() => {
    const increase = () => changeValue(stepValue(value, step))
    const decrease = () => changeValue(stepValue(value, -step))

    return {
      endAdornment: <StyledAdornment increase={increase} decrease={decrease} />,
    }
  }, [value, step, changeValue])

  return (
    <div className={className}>
      <TextField
        value={inputStr}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        InputLabelProps={inputLabelProps}
        InputProps={InputProps}
        variant={variant}
        {...textFieldProps}
      />
    </div>
  )
}

export default styled(NumberInput)`
  :hover ${StyledAdornment} {
    visibility: visible;
  }
  input {
    width: 120px;
  }
`
