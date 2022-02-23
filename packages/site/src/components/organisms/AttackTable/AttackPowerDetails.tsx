import styled from "@emotion/styled";
import {
  AttackPowerParams,
  AttackPower,
  AttackPowerModifier,
} from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { numstr } from "../../../utils";
import { LabeledValue, Divider } from "../../atoms";

function hasMod(mod: AttackPowerModifier): boolean {
  return mod.a != 1 || mod.b != 0;
}

const AttackPowerModifierLabel: React.FC<{
  label: string;
  mod: AttackPowerModifier;
}> = ({ label, mod }) => {
  if (!hasMod(mod)) {
    return null;
  }

  const text = `x${numstr(mod.a)} +${numstr(mod.b)}`;

  return <LabeledValue label={label} value={text} />;
};

type AttackPowerDetailsProps = {
  power: AttackPower;
  params: AttackPowerParams;
};

const AttackPowerDetails: React.FCX<AttackPowerDetailsProps> = ({
  className,
  power,
  params,
}) => {
  const { t } = useTranslation("common");

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
          label={t("ApShellModifier")}
          value={numstr(params.ap_shell_mod) || "-"}
        />
      )}
      {params.carrier_power && (
        <LabeledValue
          label={t("CarrierModifier")}
          value={numstr(params.carrier_power) || "-"}
        />
      )}
      {params.proficiency_critical_mod && (
        <LabeledValue
          label={t("ProficiencyCriticalModifier")}
          value={numstr(params.proficiency_critical_mod) || "-"}
        />
      )}
      {Boolean(params.armor_penetration) && (
        <LabeledValue
          label={t("ArmorPenetration")}
          value={numstr(params.armor_penetration) || "-"}
        />
      )}
      {params.remaining_ammo_mod !== 1 && (
        <LabeledValue
          label={t("RemainingAmmoMod")}
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
            <AttackPowerModifierLabel key={key} label={t(key)} mod={mod} />
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
