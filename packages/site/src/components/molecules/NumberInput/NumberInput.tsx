import { cn } from "../../../styles/cn";
import { round } from "@fh/utils";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Button, InputAdornment } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import simpleEvaluate from "simple-evaluate";

import { Input, InputProps } from "../../atoms";

import { useLongPress } from "./useLongPress";

function evaluate(str: string): number | null {
  if (str === "") {
    return null;
  }
  try {
    const num = Number(simpleEvaluate(null, toHalf(str)));
    return Number.isFinite(num) ? num : null;
  } catch (_) {
    return null;
  }
}

function toHalf(str: string): string {
  return str.replace(/[\uff10-\uff19]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
}

function format(str: string): string {
  return str.replace(/[^0-9\uff10-\uff19. ()*/+-]/g, "");
}

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

interface NumberInputAdornmentProps {
  onIncrease: () => void;
  onDecrease: () => void;
  onFinish: () => void;
  disabled: boolean;
}

const NumberInputAdornment: React.FCX<NumberInputAdornmentProps> = ({
  className,
  onIncrease,
  onDecrease,
  onFinish,
  disabled,
}) => {
  const increaseHandlers = useLongPress({ onPress: onIncrease, onFinish });
  const decreaseHandlers = useLongPress({ onPress: onDecrease, onFinish });

  return (
    <InputAdornment className={cn("flex-col justify-center ml-0", className)} position="end">
      <Button
        className="flex h-5 w-8"
        aria-label="increase"
        disabled={disabled}
        {...increaseHandlers}
      >
        <ArrowDropUpIcon />
      </Button>
      <Button
        className="flex h-5 w-8"
        aria-label="decrease"
        disabled={disabled}
        {...decreaseHandlers}
      >
        <ArrowDropDownIcon />
      </Button>
    </InputAdornment>
  );
};

export interface NumberInputProps extends Omit<InputProps, "type" | "onChange" | "onInput"> {
  value: number | null;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  className,
  value,
  onChange,
  min,
  max,
  step = 1,
  integer = false,
  variant,
  slotProps,
  ...textFieldProps
}) => {
  const [inner, setInner] = useState(`${value ?? ""}`);
  const innerRef = useRef(inner);
  innerRef.current = inner;

  const handleBlur = useCallback(() => {
    setInner((str) => {
      const num = evaluate(str);
      if (num === null) {
        return `${value ?? ""}`;
      }
      const normalized = clamp(integer ? Math.trunc(num) : num, min, max);
      return num === normalized ? toHalf(str) : String(normalized);
    });
  }, [value, min, max, integer]);

  useEffect(() => {
    const num = evaluate(innerRef.current);
    const committed = integer && num !== null ? Math.trunc(num) : num;
    if (committed !== value) {
      setInner(`${value ?? ""}`);
    }
  }, [value, integer]);

  const inputSlotProps = slotProps?.input;
  const mergedInputProps = useMemo<NonNullable<NonNullable<InputProps["slotProps"]>["input"]>>(
    () => (ownerState) => {
      const inputProps =
        typeof inputSlotProps === "function" ? inputSlotProps(ownerState) : inputSlotProps;
      const disabled = textFieldProps.disabled || inputProps?.disabled || false;
      const normalize = (num: number) => clamp(integer ? Math.trunc(num) : num, min, max);
      const update = (value: string) => {
        const num = evaluate(value);
        if (onChange && num !== null) {
          onChange(normalize(num));
        }
      };

      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = format(event.currentTarget.value);
        setInner(value);
        update(value);
      };

      const increase = () => {
        setInner((current) => {
          const currentNum = normalize(evaluate(current) || 0);
          const nextNum = stepValue(currentNum, step);
          return clamp(nextNum, min, max).toString();
        });
      };

      const decrease = () => {
        setInner((current) => {
          const currentNum = normalize(evaluate(current) || 0);
          const nextNum = stepValue(currentNum, -step);
          return clamp(nextNum, min, max).toString();
        });
      };

      const handleFinish = () => {
        update(innerRef.current);
      };

      const onCompositionEnd = () => {
        setInner(toHalf);
      };

      const endAdornment = (
        <NumberInputAdornment
          onIncrease={increase}
          onDecrease={decrease}
          onFinish={handleFinish}
          disabled={disabled}
        />
      );

      return {
        onChange: handleChange,
        onCompositionEnd,
        endAdornment,
        ...inputProps,
      };
    },
    [min, max, step, integer, textFieldProps.disabled, onChange, inputSlotProps],
  );

  return (
    <Input
      className={cn(
        "[&_.MuiInputAdornment-positionEnd]:invisible [&:hover_.MuiInputAdornment-positionEnd]:visible [&:focus-within_.MuiInputAdornment-positionEnd]:visible [&_.MuiInputLabel-root]:whitespace-nowrap [&_.MuiOutlinedInput-root]:pr-0",
        className,
      )}
      value={inner}
      onBlur={handleBlur}
      slotProps={{
        ...slotProps,
        input: mergedInputProps,
        htmlInput: (ownerState) => ({
          inputMode: "numeric",
          ...(typeof slotProps?.htmlInput === "function"
            ? slotProps.htmlInput(ownerState)
            : slotProps?.htmlInput),
        }),
      }}
      variant={variant}
      {...textFieldProps}
    />
  );
};

export default NumberInput;
