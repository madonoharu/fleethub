import styled from "@emotion/styled";
import { round } from "@fh/utils";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import {
  Button,
  InputAdornment,
  InputProps as MuiInputProps,
} from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Input, InputProps } from "../../atoms";

import { useLongPress } from "./useLongPress";

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
  onIncrease: () => void;
  onDecrease: () => void;
  onFinish: () => void;
};

const Adornment: React.FCX<AdornmentProps> = ({
  className,
  onIncrease,
  onDecrease,
  onFinish,
}) => {
  const increaseProps = useLongPress({ onPress: onIncrease, onFinish });
  const decreaseProps = useLongPress({ onPress: onDecrease, onFinish });

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
  value: number | null;
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
  const valueStr = value === null ? "" : value.toString();

  const [text, setText] = useState(valueStr);
  const textRef = useRef(text);
  textRef.current = text;

  const [isFocused, setIsFocused] = useState(false);
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  useEffect(() => {
    if (!isFocused && text !== valueStr) {
      setText(valueStr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, valueStr]);

  const mergedInputProps: MuiInputProps = useMemo(() => {
    const update = (value: string) => {
      const num = toNumber(value);
      if (onChange && num !== null) {
        onChange(clamp(num, min, max));
      }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      setText(value);
      update(value);
    };

    const increase = () => {
      setText((current) => {
        const currentNum = toNumber(current) || 0;
        const nextNum = stepValue(currentNum, step);
        return clamp(nextNum, min, max).toString();
      });
    };

    const decrease = () => {
      setText((current) => {
        const currentNum = toNumber(current) || 0;
        const nextNum = stepValue(currentNum, -step);
        return clamp(nextNum, min, max).toString();
      });
    };

    const handleFinish = () => {
      update(textRef.current);
    };

    const endAdornment = (
      <Adornment
        onIncrease={increase}
        onDecrease={decrease}
        onFinish={handleFinish}
      />
    );

    return {
      onChange: handleChange,
      endAdornment,
      ...InputProps,
    };
  }, [min, max, step, onChange, InputProps]);

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
