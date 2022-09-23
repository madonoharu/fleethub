import { Stack } from "@mui/material";
import { CustomPowerModifiers } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { Divider } from "../../atoms";

import AttackPowerModifierForm from "./AttackPowerModifierForm";

export const CUSTOM_POWER_MODIFIERS_KEYS = [
  "basic_power_mod",
  "precap_mod",
  "postcap_mod",
  "historical_mod",
] as const;

export type CustomPowerModifiersFormProps = {
  value: CustomPowerModifiers;
  onChange?: (value: CustomPowerModifiers) => void;
};

const CustomPowerModifiersForm: React.FCX<CustomPowerModifiersFormProps> = ({
  className,
  style,
  value,
  onChange,
}) => {
  const { t } = useTranslation("common");

  const bind =
    <K extends keyof CustomPowerModifiers>(key: K) =>
    (input: CustomPowerModifiers[K]) => {
      onChange?.({ ...value, [key]: input });
    };

  return (
    <Stack className={className} style={style} gap={1} mb={1}>
      {CUSTOM_POWER_MODIFIERS_KEYS.map((key) => (
        <React.Fragment key={key}>
          <Divider label={t(key)} />
          <AttackPowerModifierForm value={value[key]} onChange={bind(key)} />
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default CustomPowerModifiersForm;
