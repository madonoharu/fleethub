import React from "react"
import styled from "styled-components"

import MuiSlider, { SliderProps } from "@material-ui/core/Slider"

type Props = Omit<SliderProps, "onChange" | "value"> & {
  value?: number
  onChange?: (value: number) => void
}

const Component = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  const { onChange } = props
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<{}>, value: number | number[]) => {
      if (typeof value === "number" && onChange) onChange(value)
    },
    [onChange]
  )
  return <MuiSlider {...props} onChange={handleChange} />
})

export default styled(Component)``
