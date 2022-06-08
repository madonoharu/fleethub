import { styled } from "@mui/system";
import { AttackPowerModifier } from "fleethub-core";
import React from "react";

import { NumberInput } from "../../molecules";

const StyledInput = styled(NumberInput)`
  width: 120px;
`;

type AttackPowerModifierFormProps = {
  value: AttackPowerModifier | undefined;
  onChange?: (value: AttackPowerModifier) => void;
};

const AttackPowerModifierForm: React.FCX<AttackPowerModifierFormProps> = ({
  className,
  style,
  value,
  onChange,
}) => {
  const current = value || { a: 1, b: 0 };

  return (
    <div className={className} style={style}>
      <StyledInput
        label="乗算"
        min={0}
        step={0.1}
        value={current.a}
        onChange={(a) => onChange?.({ ...current, a })}
      />
      <StyledInput
        label="加算"
        value={current.b}
        onChange={(b) => onChange?.({ ...current, b })}
      />
    </div>
  );
};

export default styled(AttackPowerModifierForm)`
  display: flex;
  gap: 8px;
`;
