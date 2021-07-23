import styled from "@emotion/styled";
import { Org } from "@fleethub/core";
import { Paper } from "@material-ui/core";
import React from "react";

import { Tabs, TabsProps } from "../../molecules";
import AntiAirScreen from "./AntiAirScreen";
import ContactChancePanel from "./ContactChancePanel";
import DayAttackRateTable from "./DayAttackRateTable";
import MiscScreen from "./MiscScreen";
import NightCutinScreen from "./NightCutinScreen";

type Props = {
  org: Org;
};

const OrgAnalysisPanel: React.FCX<Props> = ({ className, org }) => {
  const list: TabsProps["list"] = [
    { label: "弾着戦爆発動率", panel: <DayAttackRateTable org={org} /> },
    { label: "触接率", panel: <ContactChancePanel org={org} /> },
    { label: "夜戦CI率", panel: <NightCutinScreen org={org} /> },
    { label: "対空", panel: <AntiAirScreen org={org} /> },
    { label: "その他", panel: <MiscScreen org={org} /> },
  ];

  return (
    <Paper>
      <Tabs className={className} list={list} />
    </Paper>
  );
};

export default styled(OrgAnalysisPanel)`
  padding: 16px;
  min-height: 480px;
  > * {
    margin-right: auto;
    margin-left: auto;
  }
`;
