import { styled } from "@mui/system";
import { useTranslation } from "next-i18next";
import React from "react";

import { NumberInput, RestartAltButton } from "../../molecules";

interface ResettableInputProps {
  label?: string;
  defaultValue: number | null | undefined;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
}

const INPUT_LABEL_PROPS = {
  shrink: true,
};

const ResettableInput: React.FCX<ResettableInputProps> = ({
  className,
  label,
  defaultValue = null,
  value = null,
  onChange,
  min,
  max,
  step,
}) => {
  const { t } = useTranslation("common");

  const hasValue = typeof value === "number" && value !== defaultValue;
  const color = hasValue ? "secondary" : undefined;

  const handleReset = () => {
    onChange(null);
  };

  return (
    <div className={className}>
      <NumberInput
        InputLabelProps={INPUT_LABEL_PROPS}
        color={color}
        focused={hasValue}
        label={label}
        value={value ?? defaultValue}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
      />
      <RestartAltButton
        size="medium"
        title={t("Reset")}
        sx={{ ml: 1 }}
        onClick={handleReset}
      />
    </div>
  );
};

export default styled(ResettableInput)`
  width: 160px;
  display: flex;
  align-items: center;
`;
