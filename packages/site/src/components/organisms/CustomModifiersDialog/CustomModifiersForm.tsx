import { Stack } from "@mui/material";
import { CustomModifiers } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { Divider } from "../../atoms";

import AttackPowerModifierForm from "./AttackPowerModifierForm";

const KEYS = ["basic_power_mod", "precap_mod", "postcap_mod"] as const;

export type CustomModifiersFormProps = {
  value: CustomModifiers;
  onChange?: (value: CustomModifiers) => void;
};

const CustomModifiersForm: React.FCX<CustomModifiersFormProps> = ({
  className,
  style,
  value,
  onChange,
}) => {
  const { t } = useTranslation("common");

  const bind =
    <K extends keyof CustomModifiers>(key: K) =>
    (input: CustomModifiers[K]) => {
      onChange?.({ ...value, [key]: input });
    };

  return (
    <Stack className={className} style={style} gap={1} mb={1}>
      {KEYS.map((key) => (
        <React.Fragment key={key}>
          <Divider label={t(key)} />
          <AttackPowerModifierForm value={value[key]} onChange={bind(key)} />
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default CustomModifiersForm;
