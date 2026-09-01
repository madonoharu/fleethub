import { Tabs, Tab, Stack, Paper } from "@mui/material";
import type { Comp, Ship, NodeAttackAnalyzerConfig } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React, { useMemo, useState } from "react";

import { useFhCore, useShip, useShipName } from "../../../hooks";
import { Checkbox, Flexbox } from "../../atoms";

import AttackReportDetails from "./AttackReportDetails";
import FleetCutinAnalysisTable from "./FleetCutinAnalysisTable";

const KEYS = [
  "day",
  "night",
  "closing_torpedo",
  "opening_asw",
  "support_shelling",
] as const;

type TabKey = (typeof KEYS)[number];

const labelMap = {
  day: "Day",
  night: "Night",
  closing_torpedo: "AttackType.Torpedo",
  opening_asw: "OpeningAsw",
  support_shelling: "Support",
} as const;

interface Props {
  config: NodeAttackAnalyzerConfig;
  leftComp: Comp | undefined;
  leftShip: Ship | undefined;
  rightComp: Comp | undefined;
  rightShip: Ship | undefined;
}

const NodeAttackDetails: React.FC<Props> = ({
  config,
  leftComp,
  leftShip,
  rightComp,
  rightShip,
}) => {
  const { t } = useTranslation("common");
  const { analyzer } = useFhCore();
  const [key, setKey] = useState<TabKey>("day");
  const [compareShipId, setCompareShipId] = useState<string>();
  // 分布グラフは描画が重いので、既定では畳んでおく。
  const [showDensity, setShowDensity] = useState(false);
  const compareShip = useShip(compareShipId);
  const compareShipName = useShipName(compareShip?.ship_id ?? 0);

  // 対ボスでは1回 2ms 前後かかる。タブや比較艦の切り替えのたびに走らないよう memo する。
  const result = useMemo(
    () =>
      leftComp && leftShip && rightComp && rightShip
        ? analyzer.analyze_node_attack(
            config,
            leftComp,
            leftShip,
            rightComp,
            rightShip,
          )
        : undefined,
    [analyzer, config, leftComp, leftShip, rightComp, rightShip],
  );

  // 同一編成の別の艦（＝別の装備構成）との重ね合わせ比較用。
  const compareResult = useMemo(
    () =>
      leftComp && leftShip && rightComp && rightShip && compareShip
        ? compareShip.id !== leftShip.id
          ? analyzer.analyze_node_attack(
              config,
              leftComp,
              compareShip,
              rightComp,
              rightShip,
            )
          : undefined
        : undefined,
    [analyzer, config, leftComp, leftShip, rightComp, rightShip, compareShip],
  );

  if (!leftComp || !leftShip || !rightComp || !rightShip || !result) {
    return null;
  }

  const handleChange = (event: unknown, value: TabKey) => {
    setKey(value);
  };

  return (
    <Paper sx={{ p: 1 }}>
      <Flexbox>
        <Tabs value={key} onChange={handleChange}>
          {KEYS.map((key) => (
            <Tab
              key={key}
              label={t(labelMap[key])}
              value={key}
              disabled={
                !result.left[key].is_active && !result.right[key].is_active
              }
            />
          ))}
        </Tabs>

        {/* 装甲破砕・史実補正・着上陸戦と同じ切り替え。 */}
        <Checkbox
          css={{ marginLeft: 8, flexShrink: 0 }}
          label={t("DamageDistribution.Toggle")}
          checked={showDensity}
          onChange={setShowDensity}
        />
      </Flexbox>

      <Stack gap={1} mt={1}>
        <AttackReportDetails
          css={{ flexBasis: 1, flexGrow: 1 }}
          tag={key}
          analysis={result.left}
          targetMaxHp={rightShip.max_hp}
          targetCurrentHp={rightShip.current_hp}
          showDensity={showDensity}
          comp={leftComp}
          attackerShipId={leftShip.id}
          compareShipId={compareShipId}
          compareAnalysis={compareResult?.left}
          compareShipName={compareShip ? compareShipName : undefined}
          onCompareShipChange={setCompareShipId}
        />
        <AttackReportDetails
          css={{ flexBasis: 1, flexGrow: 1 }}
          tag={key}
          analysis={result.right}
          targetMaxHp={leftShip.max_hp}
          targetCurrentHp={leftShip.current_hp}
          showDensity={showDensity}
        />
      </Stack>

      {key === "day" && (
        <FleetCutinAnalysisTable data={result.shelling_fleet_cutin} />
      )}
      {key === "night" && (
        <FleetCutinAnalysisTable data={result.night_fleet_cutin} />
      )}
    </Paper>
  );
};

export default NodeAttackDetails;
