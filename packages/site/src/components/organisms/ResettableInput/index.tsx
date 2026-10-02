import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
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
    <div className={cn("flex w-[160px] items-center", className)}>
      <NumberInput
        slotProps={{ inputLabel: INPUT_LABEL_PROPS }}
        color={color}
        focused={hasValue}
        label={label}
        value={value ?? defaultValue}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
      />
      <RestartAltButton size="medium" title={t("Reset")} className="ml-2" onClick={handleReset} />
    </div>
  );
};

export default ResettableInput;
