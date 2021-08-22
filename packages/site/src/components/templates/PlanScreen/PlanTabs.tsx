import styled from "@emotion/styled";
import { Org } from "@fleethub/core";
import { FLEET_KEYS, nonNullable } from "@fleethub/utils";
import React from "react";
import { PlanFileEntity } from "../../../store";

import { Tabs, TabsProps } from "../../molecules";
import { FleetScreen, LandBaseScreen, GkcoiScreen } from "../../organisms";

import PlanNodeList from "./PlanNodeList";

const height = 40;

type PlanTabsProps = {
  org: Org;
  file?: PlanFileEntity;
};

const PlanTabs: React.FCX<PlanTabsProps> = ({ className, org, file }) => {
  const fleetTabs: TabsProps["list"] = FLEET_KEYS.map((key) => ({
    className: "fleet-tab-label",
    label: key.toUpperCase(),
    panel: <FleetScreen fleet={org.get_fleet(key)} />,
  }));

  const list = [
    ...fleetTabs,
    { label: "基地航空隊", panel: <LandBaseScreen org={org} /> },
    file && { label: "敵編成", panel: <PlanNodeList file={file} /> },
    { label: "画像出力", panel: <GkcoiScreen org={org} /> },
  ].filter(nonNullable);

  return <Tabs className={className} list={list} />;
};

export default styled(PlanTabs)`
  > .MuiTabs-root {
    min-height: ${height}px;

    .MuiTab-root {
      min-height: ${height}px;
    }

    .fleet-tab-label {
      padding: 0;
      width: 40px;
    }
  }
`;
