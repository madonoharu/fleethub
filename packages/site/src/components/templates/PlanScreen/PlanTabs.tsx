import styled from "@emotion/styled";
import { FleetKey, FLEET_KEYS } from "@fh/utils";
import { Org } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { CompContext, useAppDispatch } from "../../../hooks";
import { PlanEntity, orgsSlice } from "../../../store";
import { Tabs, TabsProps } from "../../molecules";
import {
  LandBaseScreen,
  GkcoiScreen,
  Swappable,
  FleetScreen,
} from "../../organisms";
import NodeAttackAnalyzer from "../../organisms/NodeAttackAnalyzer";

interface FleetTabPanelProps {
  org: Org;
  fleetKey: FleetKey;
}

const FleetTabPanel: React.FCX<FleetTabPanelProps> = ({
  className,
  org,
  fleetKey,
}) => {
  const comp = org.create_comp_by_key(fleetKey);
  const fleet = org.clone_fleet(fleetKey);

  return (
    <CompContext.Provider value={comp}>
      <FleetScreen className={className} comp={comp} fleet={fleet} />
    </CompContext.Provider>
  );
};

const StyledSwappable = styled(Swappable)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 28px;
  margin: 2px;
` as typeof Swappable;

interface PlanTabsProps {
  org: Org;
  file?: PlanEntity;
}

const PlanTabs: React.FCX<PlanTabsProps> = ({ className, org, file }) => {
  const { t } = useTranslation("common");

  const dispatch = useAppDispatch();

  const handleFleetSwap = (
    event: Parameters<typeof orgsSlice.actions.swapFleet>[0]
  ) => {
    dispatch(orgsSlice.actions.swapFleet(event));
  };

  const fleetTabs: TabsProps["list"] = FLEET_KEYS.map((key) => ({
    className: "fleet-tab-label",
    label: (
      <StyledSwappable
        type="fleet"
        item={{ org: org.id, key }}
        onSwap={handleFleetSwap}
      >
        {key.toUpperCase()}
      </StyledSwappable>
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

  return <Tabs className={className} list={list} size="small" />;
};

export default styled(PlanTabs)`
  .fleet-tab-label {
    padding: 0;
  }
`;
