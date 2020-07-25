import React from "react"
import styled from "styled-components"

import { FormControlLabel, Checkbox as MuiCheckbox, CheckboxProps as MuiCheckboxProps } from "@material-ui/core"

type Props = {
  checked?: boolean
  onChange?: (value: boolean) => void
  label?: React.ReactNode
} & Pick<MuiCheckboxProps, "size">

const Checkbox: React.FCX<Props> = ({ className, checked, onChange, label, size }) => {
  const handleChange = (event: unknown, value: boolean) => onChange?.(value)

  const elem = <MuiCheckbox size={size} checked={checked} onChange={handleChange} />

  if (!label) return elem

  return <FormControlLabel className={className} label={label} control={elem} />
}

export default Checkbox
