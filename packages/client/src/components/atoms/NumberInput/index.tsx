import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import clsx from "clsx"
import { round } from "lodash-es"

import TextField, { TextFieldProps } from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import MuiButton from "@material-ui/core/Button"
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp"
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown"
import { makeStyles, styled } from "@material-ui/core/styles"

import usePress from "./usePress"

const Button = styled(MuiButton)({
  display: "block",
  padding: 0,
  width: 24,
  height: 16,
  lineHeight: 1,
})

const useStyles = makeStyles({
  root: {
    "&:hover $adornment": {
      visibility: "visible",
    },
  },
  input: {
    width: 8 * 15,
  },
  label: {
    whiteSpace: "nowrap",
  },
  adornment: {
    visibility: "hidden",
  },
})

const stepValue = (value: number, step: number) => {
  const precision = Math.ceil(-Math.log10(Math.abs(step)))
  return round(value + step, precision)
}

type NumberInputAdornmentProps = {
  className?: string
  increase: () => void
  decrease: () => void
}

const NumberInputAdornment: React.FC<NumberInputAdornmentProps> = ({ className, increase, decrease }) => {
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
  value,
  onChange,
  min,
  max,
  step = 1,
  variant,
  ...textFieldProps
}) => {
  const classes = useStyles()

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

  const inputLabelProps = useMemo(() => ({ className: classes.label }), [])

  const InputProps = useMemo(() => {
    const increase = () => changeValue(stepValue(value, step))
    const decrease = () => changeValue(stepValue(value, -step))

    return {
      endAdornment: <NumberInputAdornment className={classes.adornment} increase={increase} decrease={decrease} />,
    }
  }, [value, step, changeValue])

  return (
    <div className={classes.root}>
      <TextField
        className={clsx(!textFieldProps.fullWidth && classes.input)}
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

export default NumberInput
