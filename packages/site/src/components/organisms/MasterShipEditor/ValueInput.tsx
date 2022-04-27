import { styled } from "@mui/system";
import React from "react";

import { NumberInput } from "../../molecules";

interface ValueInputProps {
  defaultValue: number | null;
  value: number | null;
  onChange: (value: number) => void;
}

const ValueInput: React.FCX<ValueInputProps> = ({
  className,
  defaultValue,
  value,
  onChange,
}) => {
  const hasValue = value !== null && value !== defaultValue;
  const color = hasValue ? "secondary" : undefined;

  return (
    <NumberInput
      className={className}
      color={color}
      focused={hasValue}
      value={value ?? defaultValue}
      onChange={onChange}
    />
  );
};

export default styled(ValueInput)`
  width: 88px;
`;
