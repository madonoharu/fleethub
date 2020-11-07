import React, { useCallback } from "react"

import { MenuItem } from "@material-ui/core"

import { Input, InputProps } from "../../atoms"

export const getDefaultOptionLabel = (option: unknown): string => {
  switch (typeof option) {
    case "number":
      return option.toString()
    case "string":
      return option
    case "object": {
      if (!option) return ""

      const { label, name } = option as { [K in string]: unknown }

      if (typeof label === "string") return label
      if (typeof name === "string") return name
    }
  }
  return ""
}

export type SelectComponentProps<T> = {
  className?: string
  options: readonly T[]
  value: T
  onChange: (option: T) => void
  getOptionLabel?: (option: T) => React.ReactNode
}

export type SelectComponent<P = {}> = {
  <T>(props: SelectComponentProps<T> & P): React.ReactElement
}

export type SelectInputProps = Omit<InputProps, keyof SelectComponentProps<unknown>>

const Select: SelectComponent<SelectInputProps> = (props) => {
  const { options, value, onChange, getOptionLabel = getDefaultOptionLabel, variant, ...muiProps } = props

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onChange(options[Number(event.target.value)]),
    [options, onChange]
  )

  return (
    <Input value={options.indexOf(value)} variant={variant} onChange={handleChange} select {...muiProps}>
      {options.map((option, index) => (
        <MenuItem key={index} value={index}>
          {getOptionLabel(option)}
        </MenuItem>
      ))}
    </Input>
  )
}

export default Select
