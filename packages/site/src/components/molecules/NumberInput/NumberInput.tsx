import styled from "@emotion/styled";
import { round } from "@fh/utils";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import {
  Button,
  InputAdornment,
  InputProps as MuiInputProps,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { Input, InputProps } from "../../atoms";

import usePress from "./usePress";

const StyledButton = styled(Button)`
  display: flex;
  padding: 0;
  height: 20px;
  min-height: 0;
`;

function stepValue(value: number, step: number): number {
  const precision = Math.ceil(-Math.log10(Math.abs(step)));
  return round(value + step, precision);
}

function clamp(value: number, min?: number, max?: number): number {
  let r = value;

  if (typeof min === "number") {
    r = Math.max(r, min);
  }
  if (typeof max === "number") {
    r = Math.min(r, max);
  }

  return r;
}

type AdornmentProps = {
  increase: () => void;
  decrease: () => void;
};

const Adornment: React.FCX<AdornmentProps> = ({
  className,
  increase,
  decrease,
}) => {
  const increaseProps = usePress(increase);
  const decreaseProps = usePress(decrease);

  return (
    <InputAdornment className={className} position="end">
      <div>
        <StyledButton aria-label="increase" {...increaseProps}>
          <ArrowDropUpIcon />
        </StyledButton>
        <StyledButton aria-label="decrease" {...decreaseProps}>
          <ArrowDropDownIcon />
        </StyledButton>
      </div>
    </InputAdornment>
  );
};

function toHalf(str: string): string {
  return str.replace(/[\uff10-\uff19]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  );
}

function toNumber(str: string): number | null {
  if (str === "") {
    return null;
  }

  const num = Number(toHalf(str));
  if (!Number.isFinite(num)) {
    return null;
  }

  return num;
}

export type NumberInputProps = {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
} & Omit<InputProps, "type" | "inputProps" | "onChange" | "onInput">;

const NumberInput: React.FC<NumberInputProps> = ({
  className,
  value,
  onChange,
  min,
  max,
  step = 1,
  variant,
  InputProps,
  ...textFieldProps
}) => {
  const [text, setText] = React.useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const handleFocus = React.useCallback(() => setIsFocused(true), []);
  const handleBlur = React.useCallback(() => setIsFocused(false), []);

  useEffect(() => {
    if (!isFocused && text !== value.toString()) {
      setText(value.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, value]);

  const debounced = useDebouncedCallback((value: string) => {
    const num = toNumber(value);

    if (onChange && num !== null) {
      onChange(clamp(num, min, max));
    }
  }, 80);

  const update = (fn: (value: string) => string) => {
    setText((value) => {
      const next = fn(value);
      debounced(next);
      return next;
    });
  };

  const mergedInputProps: MuiInputProps = useMemo(() => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      update(() => event.target.value);
    };

    const increase = () => {
      update((current) => {
        const currentNum = toNumber(current);
        if (currentNum === null) {
          return current;
        }

        const nextNum = stepValue(currentNum, step);
        return clamp(nextNum, min, max).toString();
      });
    };

    const decrease = () => {
      update((current) => {
        const currentNum = toNumber(current);
        if (currentNum === null) {
          return current;
        }

        const nextNum = stepValue(currentNum, -step);
        return clamp(nextNum, min, max).toString();
      });
    };

    const endAdornment = <Adornment increase={increase} decrease={decrease} />;

    return {
      onChange: handleChange,
      endAdornment,
      ...InputProps,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, step, InputProps]);

  return (
    <div className={className}>
      <Input
        value={text}
        onFocus={handleFocus}
        onBlur={handleBlur}
        InputProps={mergedInputProps}
        variant={variant}
        {...textFieldProps}
      />
    </div>
  );
};

export default styled(NumberInput)`
  .MuiInputAdornment-positionEnd {
    visibility: hidden;
  }

  :hover .MuiInputAdornment-positionEnd {
    visibility: visible;
  }

  .MuiInputLabel-root {
    white-space: nowrap;
  }
  .MuiOutlinedInput-adornedEnd {
    padding-right: 8px;
  }
`;
