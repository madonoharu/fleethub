import MuiSlider, { SliderProps } from "@mui/material/Slider";
import React from "react";

interface Props extends Omit<SliderProps, "onChange" | "value"> {
  value?: number;
  onChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLSpanElement, Props>((props, ref) => {
  const { onChange, ...rest } = props;

  const handleChange = React.useCallback(
    (event: Event, value: number | number[]) => {
      if (typeof value === "number" && onChange) onChange(value);
    },
    [onChange]
  );

  return <MuiSlider ref={ref} {...rest} onChange={handleChange} />;
});

export default Slider;
