import { styled } from "@mui/system";
import { AttackPowerModifier } from "fleethub-core";
import React from "react";

import { NumberInput } from "../../molecules";

const StyledInput = styled(NumberInput)`
  width: 120px;
`;

type AttackPowerModifierFormProps = {
  value: AttackPowerModifier;
  onChange?: (value: AttackPowerModifier) => void;
};

const AttackPowerModifierForm: React.FCX<AttackPowerModifierFormProps> = ({
  className,
  style,
  value,
  onChange,
}) => {
  return (
    <div className={className} style={style}>
      <StyledInput
        label="乗算"
        min={0}
        step={0.1}
        value={value.a}
        onChange={(a) => onChange?.({ ...value, a })}
      />
      <StyledInput
        label="加算"
        value={value.b}
        onChange={(b) => onChange?.({ ...value, b })}
      />
    </div>
  );
};

export default styled(AttackPowerModifierForm)`
  display: flex;
  gap: 8px;
`;
