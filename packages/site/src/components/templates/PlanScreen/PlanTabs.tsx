import { FleetKey, FLEET_KEYS } from "@fh/utils";
import { Org } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { CompContext, useAppDispatch } from "../../../hooks";
import { PlanEntity, orgsSlice } from "../../../store";
import { Tabs, TabsProps } from "../../molecules";
import { LandBaseScreen, GkcoiScreen, Swappable, FleetScreen } from "../../organisms";
import NodeAttackAnalyzer from "../../organisms/NodeAttackAnalyzer";

interface FleetTabPanelProps {
  org: Org;
  fleetKey: FleetKey;
}

const FleetTabPanel: React.FCX<FleetTabPanelProps> = ({ className, org, fleetKey }) => {
  const comp = org.create_comp_by_key(fleetKey);
  const fleet = org.clone_fleet(fleetKey);

  return (
    <CompContext.Provider value={comp}>
      <FleetScreen className={className} comp={comp} fleet={fleet} />
    </CompContext.Provider>
  );
};

interface PlanTabsProps {
  org: Org;
  file?: PlanEntity;
}

const PlanTabs: React.FCX<PlanTabsProps> = ({ className, org, file }) => {
  const { t } = useTranslation("common");

  const dispatch = useAppDispatch();

  const handleFleetSwap = (event: Parameters<typeof orgsSlice.actions.swapFleet>[0]) => {
    dispatch(orgsSlice.actions.swapFleet(event));
  };

  const fleetTabs: TabsProps["list"] = FLEET_KEYS.map((key) => ({
    className: "fleet-tab-label",
    label: (
      <Swappable
        className="m-0.5 flex h-7 min-w-10 items-center justify-center"
        type="fleet"
        item={{ org: org.id, key }}
        onSwap={handleFleetSwap}
      >
        {key.toUpperCase()}
      </Swappable>
    ),
    panel: <FleetTabPanel org={org} fleetKey={key} />,
  }));

  const list = [
    ...fleetTabs,
    { label: t("Lbas"), panel: <LandBaseScreen org={org} /> },
    file && {
      label: t("DamageCalculator"),
      panel: <NodeAttackAnalyzer file={file} org={org} />,
    },
    { label: t("ImageGeneration"), panel: <GkcoiScreen org={org} /> },
  ];

  return <Tabs className={cn("[&_.fleet-tab-label]:p-0", className)} list={list} size="small" />;
};

export default PlanTabs;
