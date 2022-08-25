import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import {
  AttackPowerParams,
  AttackPower,
  AttackPowerModifier,
  SpecialEnemyModifiers,
} from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { numstr } from "../../../utils";
import { LabeledValue, Divider } from "../../atoms";

function hasMod(
  mod: AttackPowerModifier | undefined
): mod is AttackPowerModifier {
  if (!mod) {
    return false;
  }

  return mod.a != 1 || mod.b != 0;
}

const AttackPowerModifierLabel: React.FC<{
  label: string;
  mod: AttackPowerModifier | undefined;
}> = ({ label, mod }) => {
  if (!hasMod(mod)) {
    return null;
  }

  const text = `x${numstr(mod.a)} +${numstr(mod.b)}`;

  return <LabeledValue label={label} value={text} />;
};

type AttackPowerDetailsProps = {
  power: AttackPower | null;
  params: AttackPowerParams | null;
};

const AttackPowerDetails: React.FCX<AttackPowerDetailsProps> = ({
  className,
  power,
  params,
}) => {
  const { t } = useTranslation("common");

  if (!power || !params) {
    return <Typography>{t("Unknown")}</Typography>;
  }

  const { special_enemy_mods, custom_mods } = params;

  const hasSpecial = Object.values(special_enemy_mods).some(hasMod);
  const hasCustom = Object.values(custom_mods).some(hasMod);

  return (
    <div className={className}>
      <LabeledValue
        label={`${t("AttackPower")} ${t("Normal")}`}
        value={numstr(power.normal) || "-"}
      />
      <LabeledValue
        label={`${t("AttackPower")} ${t("Critical")}`}
        value={numstr(power.critical) || "-"}
      />

      <LabeledValue
        label={t("BasicAttackPower")}
        value={numstr(params.basic) || "-"}
      />
      {params.ap_shell_mod && (
        <LabeledValue
          label={t("ap_shell_mod")}
          value={numstr(params.ap_shell_mod) || "-"}
        />
      )}
      {params.carrier_power && (
        <LabeledValue
          label={t("carrier_power")}
          value={numstr(params.carrier_power) || "-"}
        />
      )}
      {params.proficiency_critical_mod !== 1 && (
        <LabeledValue
          label={t("proficiency_critical_mod")}
          value={numstr(params.proficiency_critical_mod) || "-"}
        />
      )}
      {Boolean(params.armor_penetration) && (
        <LabeledValue
          label={t("armor_penetration")}
          value={numstr(params.armor_penetration) || "-"}
        />
      )}
      {params.remaining_ammo_mod !== 1 && (
        <LabeledValue
          label={t("remaining_ammo_mod")}
          value={numstr(params.remaining_ammo_mod) || "-"}
        />
      )}

      <AttackPowerModifierLabel
        label={t("precap_mod")}
        mod={params.precap_mod}
      />
      <AttackPowerModifierLabel
        label={t("postcap_mod")}
        mod={params.postcap_mod}
      />

      {hasSpecial && (
        <>
          <Divider label={t("special_enemy_mods")} />
          {Object.entries(special_enemy_mods).map(([key, mod]) => (
            <AttackPowerModifierLabel
              key={key}
              label={t(key as keyof SpecialEnemyModifiers)}
              mod={mod as AttackPowerModifier}
            />
          ))}
        </>
      )}

      {hasCustom && (
        <>
          <Divider label={t("custom_mods")} />
          <AttackPowerModifierLabel
            label={t("precap_mod")}
            mod={custom_mods.precap_mod}
          />
          <AttackPowerModifierLabel
            label={t("postcap_mod")}
            mod={custom_mods.postcap_mod}
          />
        </>
      )}
    </div>
  );
};

export default styled(AttackPowerDetails)``;
