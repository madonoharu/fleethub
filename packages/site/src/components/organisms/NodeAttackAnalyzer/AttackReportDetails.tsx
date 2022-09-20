import styled from "@emotion/styled";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { Typography } from "@mui/material";
import type { AttackAnalysis, AttackReport } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useShipName } from "../../../hooks";
import { numstr } from "../../../utils";
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
  const { attacker_is_player, attacker_ship_id, target_ship_id } = analysis;

  const attackerName = useShipName(attacker_ship_id, attacker_ship_id > 1500);
  const targetName = useShipName(target_ship_id, target_ship_id > 1500);

  const attackerColor = attacker_is_player
    ? "primary.light"
    : "secondary.light";
  const targetColor = !attacker_is_player ? "primary.light" : "secondary.light";

  const historical_mod =
    Object.values<AttackReport<unknown>>(analysis.day.data).at(0)
      ?.attack_power_params?.historical_mod || 1;

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

      {historical_mod !== 1 && (
        <Typography>
          {t("historical_mod")}: {numstr(historical_mod)}
        </Typography>
      )}

      {report.is_active ? (
        <DamageTable report={report} />
      ) : (
        <Typography>{t("AttackTypeNone")}</Typography>
      )}
    </div>
  );
};

export default styled(AttackReportDetails)`
  min-height: 320px;
  min-width: 480px;
`;
