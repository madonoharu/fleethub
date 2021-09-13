import styled from "@emotion/styled";
import { Org } from "@fleethub/core";
import { FLEET_KEYS, nonNullable } from "@fleethub/utils";
import { useTranslation } from "next-i18next";
import React from "react";
import { useDispatch } from "react-redux";

import { PlanFileEntity, orgsSlice } from "../../../store";
import { Tabs, TabsProps } from "../../molecules";
import {
  FleetScreen,
  LandBaseScreen,
  GkcoiScreen,
  PlanNodeList,
  Swappable,
} from "../../organisms";

const StyledSwappable = styled(Swappable)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 28px;
  margin: 2px;
` as typeof Swappable;

type PlanTabsProps = {
  org: Org;
  file?: PlanFileEntity;
};

const PlanTabs: React.FCX<PlanTabsProps> = ({ className, org, file }) => {
  const { t } = useTranslation("common");

  const dispatch = useDispatch();

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
    panel: <FleetScreen fleet={org.get_fleet(key)} />,
  }));

  const list = [
    ...fleetTabs,
    { label: t("Lbas"), panel: <LandBaseScreen org={org} /> },
    file && { label: "敵編成", panel: <PlanNodeList file={file} /> },
    { label: "画像出力", panel: <GkcoiScreen org={org} /> },
  ].filter(nonNullable);

  return <Tabs className={className} list={list} size="small" />;
};

export default styled(PlanTabs)`
  .fleet-tab-label {
    padding: 0;
  }
`;
