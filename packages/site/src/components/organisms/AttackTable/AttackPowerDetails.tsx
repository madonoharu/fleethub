import styled from "@emotion/styled";
import { AttackPowerParams, AttackPower } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { numstr } from "../../../utils";
import { LabeledValue } from "../../atoms";

const ModifiersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 16px;
`;

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
      <ModifiersGrid>
        {Object.entries(params.mods)
          .filter(([key, value]) =>
            key.startsWith("a") ? value !== 1 : value !== 0
          )
          .map(([key, value]) => (
            <LabeledValue
              key={key}
              label={key}
              value={numstr(value as number) || "-"}
            />
          ))}
      </ModifiersGrid>
    </div>
  );
};

export default styled(AttackPowerDetails)``;
