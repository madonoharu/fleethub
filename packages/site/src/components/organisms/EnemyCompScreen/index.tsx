import { MapEnemyComp, uncapitalize } from "@fh/utils";
import { Comp, Role } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React, { useMemo } from "react";

import { useFhCore } from "../../../hooks";
import { Tabs, TabsProps } from "../../molecules";
import FleetScreen from "../FleetScreen";

const FleetPanel: React.FCX<{ comp: Comp; role: Role }> = ({ comp, role }) => {
  const fleet = comp[uncapitalize(role)];

  if (!fleet) {
    return null;
  }

  return <FleetScreen comp={comp} fleet={fleet} />;
};

const EnemyCompScreen: React.FCX<{ enemy: MapEnemyComp }> = ({ enemy }) => {
  const { core } = useFhCore();
  const { t } = useTranslation("common");

  const comp = useMemo(() => {
    return core.create_comp_by_map_enemy(
      Uint16Array.from(enemy.main),
      enemy.escort && Uint16Array.from(enemy.escort)
    );
  }, [core, enemy]);

  const list: TabsProps["list"] = [
    {
      label: t("FleetType.Main"),
      panel: <FleetPanel comp={comp} role="Main" />,
    },
    comp.is_combined() && {
      label: t("FleetType.Escort"),
      panel: <FleetPanel comp={comp} role="Escort" />,
    },
  ];

  return <Tabs list={list} />;
};

export default EnemyCompScreen;
