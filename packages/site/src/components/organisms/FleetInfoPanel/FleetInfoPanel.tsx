import styled from "@emotion/styled";
import { Org } from "@fh/core";
import { FleetKey } from "@fh/utils";
import { Paper } from "@mui/material";
import React from "react";

import { Tabs, TabsProps } from "../../molecules";
import AntiAirScreen from "./AntiAirScreen";
import ContactChancePanel from "./ContactChancePanel";
import DayCutinRateTable from "./DayCutinRateTable";
import MiscScreen from "./MiscScreen";
import NightCutinScreen from "./NightCutinScreen";

export type FleetInfoPanelProps = {
  org: Org;
  fleetKey: FleetKey;
};

const FleetInfoPanel: React.FCX<FleetInfoPanelProps> = ({
  className,
  org,
  fleetKey,
}) => {
  const list: TabsProps["list"] = [
    {
      label: "弾着戦爆発動率",
      panel: <DayCutinRateTable org={org} fleetKey={fleetKey} />,
    },
    {
      label: "触接率",
      panel: <ContactChancePanel org={org} fleetKey={fleetKey} />,
    },
    {
      label: "夜戦CI率",
      panel: <NightCutinScreen org={org} fleetKey={fleetKey} />,
    },
    { label: "対空", panel: <AntiAirScreen org={org} fleetKey={fleetKey} /> },
    { label: "その他", panel: <MiscScreen org={org} /> },
  ];

  return (
    <Paper>
      <Tabs className={className} list={list} />
    </Paper>
  );
};

export default styled(FleetInfoPanel)`
  padding: 8px;
  min-height: 480px;
  > * {
    margin-right: auto;
    margin-left: auto;
  }
  > .MuiTabs-root {
    margin-bottom: 8px;
  }
`;
