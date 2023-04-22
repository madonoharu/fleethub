import styled from "@emotion/styled";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { Alert, Typography } from "@mui/material";
import type { AttackAnalysis } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useShipName } from "../../../hooks";
import { numstr } from "../../../utils";
import DamageStateDensityBarChart from "../AttackTable/DamageStateDensityBarChart";
import DamageTable from "../DamageTable";

interface Props {
  tag: "day" | "night" | "closing_torpedo" | "opening_asw" | "support_shelling";
  analysis: AttackAnalysis;
}

const AttackReportDetails: React.FCX<Props> = ({
  className,
  style,
  tag,
  analysis,
}) => {
  const { t } = useTranslation("common");

  const report = analysis[tag];
  const {
    attacker_is_player,
    attacker_ship_id,
    target_ship_id,
    historical_params,
  } = analysis;

  const attackerName = useShipName(attacker_ship_id, attacker_ship_id > 1500);
  const targetName = useShipName(target_ship_id, target_ship_id > 1500);

  const attackerColor = attacker_is_player
    ? "primary.light"
    : "secondary.light";
  const targetColor = !attacker_is_player ? "primary.light" : "secondary.light";

  let historicalParamsText = "";
  if (
    historical_params.power_mod.a !== 1 ||
    historical_params.power_mod.b !== 0
  ) {
    const mod = historical_params.power_mod;
    const text = ` ${t("power_mod")} x${numstr(mod.a)} +${numstr(mod.b)}`;
    historicalParamsText += text;
  }
  if (historical_params.armor_penetration !== 0) {
    historicalParamsText += ` ${t("armor_penetration")} ${numstr(
      historical_params.armor_penetration
    )}`;
  }
  if (historical_params.accuracy_mod !== 1) {
    historicalParamsText += ` ${t("accuracy_mod")} ${numstr(
      historical_params.accuracy_mod
    )}`;
  }
  if (historical_params.target_evasion_mod !== 1) {
    historicalParamsText += ` ${t("evasion")} ${numstr(
      historical_params.target_evasion_mod
    )}`;
  }

  return (
    <div className={className} style={style}>
      <Typography alignItems="center" display="flex" gap={1} mb={1}>
        <Typography variant="inherit" component="span" color={attackerColor}>
          {attackerName}
        </Typography>
        <ArrowForward fontSize="inherit" />
        <Typography variant="inherit" component="span" color={targetColor}>
          {targetName}
        </Typography>
      </Typography>

      {historicalParamsText && (
        <Typography>
          {t("historical_mod")} {historicalParamsText}
        </Typography>
      )}

      {report.is_active ? (
        <DamageTable report={report} />
      ) : (
        <Typography>{t("AttackTypeNone")}</Typography>
      )}
      {report.damage_state_density &&
      Object.keys(report.damage_state_density).length ? (
        <>
          <Typography mt={1} variant="subtitle2">
            {t("Distribution")}
          </Typography>
          <DamageStateDensityBarChart data={report.damage_state_density} />
        </>
      ) : (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {t("Unknown")}
        </Alert>
      )}
    </div>
  );
};

export default styled(AttackReportDetails)`
  min-width: 480px;
`;
