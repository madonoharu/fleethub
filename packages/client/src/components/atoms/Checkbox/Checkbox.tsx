import React from "react"
import styled from "styled-components"

import { FormControlLabel, Checkbox as MuiCheckbox } from "@material-ui/core"

type Props = {
  checked?: boolean
  onChange?: (value: boolean) => void
  label?: React.ReactNode
}

const Checkbox: React.FCX<Props> = ({ className, checked, onChange, label }) => {
  const handleChange = (event: unknown, value: boolean) => onChange?.(value)

  const elem = <MuiCheckbox checked={checked} onChange={handleChange} />

  if (!label) return elem

  return <FormControlLabel className={className} label={label} control={elem} />
}

export default Checkbox
