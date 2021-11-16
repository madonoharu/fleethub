/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { FleetKey } from "@fh/utils";
import { Paper } from "@mui/material";
import { Org } from "fleethub-core";
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
      label: "昼戦",
      panel: <DayCutinRateTable org={org} fleetKey={fleetKey} />,
    },
    {
      label: "夜戦",
      panel: <NightCutinScreen org={org} fleetKey={fleetKey} />,
    },
    {
      label: "触接率",
      panel: <ContactChancePanel org={org} fleetKey={fleetKey} />,
    },
    { label: "対空", panel: <AntiAirScreen org={org} fleetKey={fleetKey} /> },
    { label: "その他", panel: <MiscScreen org={org} fleetKey={fleetKey} /> },
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
`;
