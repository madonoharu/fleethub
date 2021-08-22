import MuiSlider, { SliderProps } from "@material-ui/core/Slider";
import React from "react";

type Props = Omit<SliderProps, "onChange" | "value"> & {
  value?: number;
  onChange?: (value: number) => void;
};

const Slider = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  const { onChange } = props;
  const handleChange = React.useCallback(
    (event: Event, value: number | number[]) => {
      if (typeof value === "number" && onChange) onChange(value);
    },
    [onChange]
  );

  return <MuiSlider ref={ref} {...props} onChange={handleChange} />;
});

export default Slider;
