import { Stack } from "@mui/material";
import { CustomModifiers } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { Divider } from "../../atoms";

import AttackPowerModifierForm from "./AttackPowerModifierForm";

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
      <Divider label={t("precap_mod")} />
      <AttackPowerModifierForm
        value={value.precap_mod}
        onChange={bind("precap_mod")}
      />
      <Divider label={t("postcap_mod")} />
      <AttackPowerModifierForm
        value={value.postcap_mod}
        onChange={bind("postcap_mod")}
      />
    </Stack>
  );
};

export default CustomModifiersForm;
