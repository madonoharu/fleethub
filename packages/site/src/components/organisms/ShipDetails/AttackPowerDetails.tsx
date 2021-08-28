import styled from "@emotion/styled";
import { AttackPowerParams, AttackPower } from "@fleethub/core";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { numstr } from "../../../utils";
import { LabeledValue } from "../../atoms";

const ModifiersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 16px;
`;

type AttackPowerDetailProps = {
  power: AttackPower;
  params: AttackPowerParams;
};

const AttackPowerDetails: React.FCX<AttackPowerDetailProps> = ({
  className,
  power,
  params,
}) => {
  const { t } = useTranslation("common");
  return (
    <div className={className}>
      <LabeledValue
        label={t("BasicAttackPower")}
        value={numstr(params.basic) || "-"}
      />
      <LabeledValue
        label={t("ApShellModifier")}
        value={numstr(params.ap_shell_mod) || "-"}
      />
      <LabeledValue
        label={t("CarrierModifier")}
        value={numstr(params.carrier_power) || "-"}
      />
      <LabeledValue
        label={t("ProficiencyCriticalModifier")}
        value={numstr(params.proficiency_critical_mod) || "-"}
      />
      <LabeledValue
        label={t("remaining_ammo_mod")}
        value={numstr(params.remaining_ammo_mod) || "-"}
      />
      <ModifiersGrid>
        {Object.entries(params.mods).map(([key, value]) => (
          <LabeledValue
            key={key}
            label={`${key}:`}
            value={numstr(value) || "-"}
          />
        ))}
      </ModifiersGrid>
    </div>
  );
};

export default styled(AttackPowerDetails)``;
