import { Paper } from "@mui/material";
import { styled } from "@mui/system";
import { Comp, Fleet } from "fleethub-core";
import { useTranslation } from "next-i18next";
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
  const { t } = useTranslation("common");

  const list: TabsProps["list"] = [
    {
      label: t("Day"),
      panel: <DayCutinRateTable />,
    },
    {
      label: t("Night"),
      panel: <NightCutinScreen />,
    },
    {
      label: t("Contact"),
      panel: <ContactChancePanel />,
    },
    { label: t("anti_air"), panel: <AntiAirScreen /> },
    { label: t("Misc"), panel: <MiscScreen comp={comp} fleet={fleet} /> },
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
