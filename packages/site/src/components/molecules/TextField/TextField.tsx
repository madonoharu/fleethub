import styled from "@emotion/styled";
import { useForkRef } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

import { Input, InputProps } from "../../atoms";
import { ClearButton } from "../IconButtons";

type TextFieldPropsBase = {
  onChange?: (value: string) => void;
};

export type TextFieldProps = Omit<InputProps, keyof TextFieldPropsBase> &
  TextFieldPropsBase;

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => {
    const { className, value = "", onChange, onBlur, variant, ...rest } = props;

    const [str, setStr] = useState(value);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (str !== value) setStr(value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setStr(event.currentTarget.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" && !rest.multiline) {
        inputRef.current?.blur();
      }
    };

    const handleClear = () => {
      setStr("");
      if ("" !== value) onChange?.("");
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);
      const current = event.currentTarget.value;
      if (current !== value) onChange?.(current);
    };

    const handleRef = useForkRef(inputRef, ref);

    return (
      <Input
        inputRef={handleRef}
        className={className}
        value={str}
        variant={variant}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        InputProps={{
          endAdornment: (
            <ClearButton
              className="ClearButton"
              size="tiny"
              onClick={handleClear}
            />
          ),
        }}
        {...rest}
      />
    );
  }
);

export default styled(TextField)`
  .ClearButton {
    visibility: hidden;
  }

  :hover .ClearButton {
    visibility: visible;
  }
`;
