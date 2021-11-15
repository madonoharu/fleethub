/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { FleetKey } from "@fh/utils";
import { Org, SimulatorResult } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFhCore } from "../../../hooks";
import { StepConfig } from "../../../store";
import { toPercent } from "../../../utils";
import DamageStateMapBarChart from "../AttackTable/DamageStateMapBarChart";
import ShipBanner from "../ShipBanner";
import Table from "../Table";

type Props = {
  player: Org;
  enemy: Org;
  config: StepConfig;
};

const SimulatorResultTable: React.FCX<Props> = ({ player, enemy, config }) => {
  const { t } = useTranslation("common");
  const { core } = useFhCore();

  const pf = player.clone_fleet("f1");
  const times = 10000;
  const timeLabel = `simulate: ${times}`;

  let simResult: SimulatorResult | undefined;

  try {
    console.time(timeLabel);
    simResult = core.simulate_shelling_support(
      pf,
      enemy,
      {
        engagement: config.engagement,
        attacker_formation: config.player.formation,
        target_formation: config.enemy.formation,
        external_power_mods: config.player.external_power_mods,
      },
      times
    );
    console.timeEnd(timeLabel);
  } catch (err) {
    console.error(err);
  }

  if (!simResult) {
    return null;
  }

  return (
    <div>
      <Table
        data={simResult.sunk_vec}
        padding="none"
        columns={[
          {
            label: "撃沈数",
            getValue: ([n]) => n,
          },
          {
            label: t("Rate"),
            getValue: (item) => toPercent(item[1]),
          },
          {
            label: t("Cumulative"),
            getValue: (item) => toPercent(item[2]),
          },
        ]}
      />
      <Table
        data={simResult.items}
        columns={[
          {
            label: t("Ship"),
            getValue: (item) => {
              const ship = enemy.get_ship_by_id(item.id);
              return <ShipBanner shipId={ship?.ship_id || 0} />;
            },
          },
          {
            label: t("Distribution"),
            getValue: (item) => (
              <DamageStateMapBarChart data={item.damage_state_map} />
            ),
          },
        ]}
      />
    </div>
  );
};

export default SimulatorResultTable;
