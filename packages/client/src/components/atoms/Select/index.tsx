import React, { useCallback } from "react"

import MuiSelect, { SelectProps as MuiSelectProps } from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"

export const getDefaultOptionLabel = (option: unknown): string => {
  switch (typeof option) {
    case "number":
      return option.toString()
    case "string":
      return option
    case "object": {
      if (!option) {
        return ""
      }
      const { label, name } = option as { [K in string]: unknown }
      if (typeof label === "string") {
        return label
      }
      if (typeof name === "string") {
        return name
      }
    }
  }
  return ""
}

export type BaseSelectProps<T> = {
  options: readonly T[]
  value: T
  onChange: (option: T) => void
  label?: string
  getOptionLabel?: (option: T) => React.ReactNode
}

export type SelectProps<T> = BaseSelectProps<T> & Omit<MuiSelectProps, keyof BaseSelectProps<T>>

export default function Select<OptionType>(props: SelectProps<OptionType>) {
  const { options, value, onChange, label, getOptionLabel = getDefaultOptionLabel, ...muiProps } = props

  const handleChange = useCallback(
    (event: React.ChangeEvent<MuiSelectProps>) => onChange(options[Number(event.target.value)]),
    [options, onChange]
  )

  return (
    <FormControl>
      {label && <InputLabel>{label}</InputLabel>}
      <MuiSelect value={options.indexOf(value)} onChange={handleChange} {...muiProps}>
        {options.map((option, index) => (
          <MenuItem key={index} value={index}>
            {getOptionLabel(option)}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  )
}
