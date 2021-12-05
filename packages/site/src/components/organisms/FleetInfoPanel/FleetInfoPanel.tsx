/** @jsxImportSource @emotion/react */
import { Paper } from "@mui/material";
import { styled } from "@mui/system";
import { Comp, Fleet } from "fleethub-core";
import React from "react";
import { CompProvider } from "../../../hooks";

import { Tabs, TabsProps } from "../../molecules";
import AntiAirScreen from "./AntiAirScreen";
import ContactChancePanel from "./ContactChancePanel";
import DayCutinRateTable from "./DayCutinRateTable";
import MiscScreen from "./MiscScreen";
import NightCutinScreen from "./NightCutinScreen";

export type FleetInfoPanelProps = {
  comp: Comp;
  fleet: Fleet;
};

const FleetInfoPanel: React.FCX<FleetInfoPanelProps> = ({
  className,
  comp,
  fleet,
}) => {
  const list: TabsProps["list"] = [
    {
      label: "昼戦",
      panel: <DayCutinRateTable />,
    },
    {
      label: "夜戦",
      panel: <NightCutinScreen />,
    },
    {
      label: "触接率",
      panel: <ContactChancePanel />,
    },
    { label: "対空", panel: <AntiAirScreen /> },
    { label: "その他", panel: <MiscScreen comp={comp} fleet={fleet} /> },
  ];

  return (
    <CompProvider comp={comp}>
      <Paper className={className}>
        <Tabs size="small" list={list} />
      </Paper>
    </CompProvider>
  );
};

export default styled(FleetInfoPanel)`
  padding: 8px;
  min-height: 480px;
`;
