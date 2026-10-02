import ArrowForward from "@mui/icons-material/ArrowForward";
import { Alert, Typography } from "@mui/material";
import type { AttackAnalysis, Comp } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useShipName } from "../../../hooks";
import { numstr } from "../../../utils";
import DamageStateDensityBarChart from "../AttackTable/DamageStateDensityBarChart";
import DamageDensitySection from "../DamageDensitySection";
import DamageTable from "../DamageTable";
import { cn } from "../../../styles";

interface Props {
  tag: "day" | "night" | "closing_torpedo" | "opening_asw" | "support_shelling";
  analysis: AttackAnalysis;
  targetMaxHp: number | undefined;
  targetCurrentHp: number | undefined;
  /** 分布グラフを出すか。描画が重いので既定は off。 */
  showDensity?: boolean | undefined;
  /** 比較セレクタを出す場合のみ渡す（攻撃側が自軍のときだけ） */
  comp?: Comp | undefined;
  attackerShipId?: string | undefined;
  compareShipId?: string | undefined;
  compareAnalysis?: AttackAnalysis | undefined;
  compareShipName?: string | undefined;
  onCompareShipChange?: ((id: string | undefined) => void) | undefined;
}

const AttackReportDetails: React.FCX<Props> = ({
  className,
  style,
  tag,
  analysis,
  targetMaxHp,
  targetCurrentHp,
  showDensity,
  comp,
  attackerShipId,
  compareShipId,
  compareAnalysis,
  compareShipName,
  onCompareShipChange,
}) => {
  const { t } = useTranslation("common");

  const report = analysis[tag];
  const { attacker_is_player, attacker_ship_id, target_ship_id, historical_params } = analysis;

  const attackerName = useShipName(attacker_ship_id, attacker_ship_id > 1500);
  const targetName = useShipName(target_ship_id, target_ship_id > 1500);

  const attackerClassName = attacker_is_player ? "text-primary-light" : "text-secondary-light";
  const targetClassName = attacker_is_player ? "text-secondary-light" : "text-primary-light";

  let historicalParamsText = "";
  if (historical_params.power_mod.a !== 1 || historical_params.power_mod.b !== 0) {
    const mod = historical_params.power_mod;
    const text = ` ${t("power_mod")} x${numstr(mod.a)} +${numstr(mod.b)}`;
    historicalParamsText += text;
  }
  if (historical_params.armor_penetration !== 0) {
    historicalParamsText += ` ${t("armor_penetration")} ${numstr(
      historical_params.armor_penetration,
    )}`;
  }
  if (historical_params.accuracy_mod !== 1) {
    historicalParamsText += ` ${t("accuracy_mod")} ${numstr(historical_params.accuracy_mod)}`;
  }
  if (historical_params.target_evasion_mod !== 1) {
    historicalParamsText += ` ${t("evasion")} ${numstr(historical_params.target_evasion_mod)}`;
  }

  return (
    <div className={className} style={style}>
      <Typography className="items-center flex gap-2 mb-2">
        <Typography variant="inherit" component="span" className={attackerClassName}>
          {attackerName}
        </Typography>
        <ArrowForward fontSize="inherit" />
        <Typography variant="inherit" component="span" className={targetClassName}>
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
      {report.damage_state_density && Object.keys(report.damage_state_density).length ? (
        <>
          <Typography className="mt-2" variant="subtitle2">
            {t("Distribution")}
          </Typography>
          <DamageStateDensityBarChart data={report.damage_state_density} />

          {showDensity && (
            <DamageDensitySection
              report={report}
              targetMaxHp={targetMaxHp}
              targetCurrentHp={targetCurrentHp}
              comp={comp}
              attackerShipId={attackerShipId}
              attackerShipName={attackerName}
              compareShipId={compareShipId}
              compareReport={compareAnalysis?.[tag]}
              compareShipName={compareShipName}
              onCompareShipChange={onCompareShipChange}
            />
          )}
        </>
      ) : (
        <Alert className="mt-2" severity="warning">
          {t("Unknown")}
        </Alert>
      )}
    </div>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof AttackReportDetails>) => (
  <AttackReportDetails {...props} className={cn("min-w-120", className)} />
);
