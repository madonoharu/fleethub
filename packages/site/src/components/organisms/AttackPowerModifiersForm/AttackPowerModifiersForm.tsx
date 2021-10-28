/** @jsxImportSource @emotion/react */
import { AttackPowerModifiers } from "fleethub-core";
import React from "react";
import { NumberInput } from "../../molecules";

type AttackPowerModifiersFormProps = {
  value: AttackPowerModifiers;
  onChange?: (value: AttackPowerModifiers) => void;
};

const AttackPowerModifiersForm: React.FCX<AttackPowerModifiersFormProps> = ({
  className,
  style,
  value,
  onChange,
}) => {
  const bind =
    <K extends keyof AttackPowerModifiers>(key: K) =>
    (next: AttackPowerModifiers[K]) =>
      onChange?.({ ...value, [key]: next });

  return (
    <div className={className} style={style}>
      <NumberInput
        label="a11"
        min={0}
        step={0.1}
        value={value.a11}
        onChange={bind("a11")}
      />
    </div>
  );
};

export default AttackPowerModifiersForm;
