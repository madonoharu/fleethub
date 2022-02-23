import { Path, PathValue } from "@fh/utils";
import { CustomModifiers } from "fleethub-core";
import { produce } from "immer";
import set from "lodash/set";
import React from "react";

import { NumberInput } from "../../molecules";

type AttackPowerModifiersFormProps = {
  value: CustomModifiers;
  onChange?: (value: CustomModifiers) => void;
};

const AttackPowerModifiersForm: React.FCX<AttackPowerModifiersFormProps> = ({
  className,
  style,
  value,
  onChange,
}) => {
  const bind =
    <P extends Path<CustomModifiers>>(path: P) =>
    (input: PathValue<CustomModifiers, P>) => {
      const next = produce(value, (draft) => {
        set(draft, path, input);
      });

      onChange?.(next);
    };

  return (
    <div className={className} style={style}>
      <NumberInput
        label="a11"
        min={0}
        step={0.1}
        value={value.postcap_mod.a}
        onChange={bind("postcap_mod.a")}
      />
    </div>
  );
};

export default AttackPowerModifiersForm;
