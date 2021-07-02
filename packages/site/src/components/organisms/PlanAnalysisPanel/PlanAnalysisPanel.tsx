import styled from "@emotion/styled";
import { Org } from "@fleethub/core";
import { Paper } from "@material-ui/core";
import React from "react";

import { Tabs, TabsProps } from "../../molecules";
// import AntiAirPanel from "./AntiAirPanel";
// import ContactChancePanel from "./ContactChancePanel";
import DayAttackRateTable from "./DayAttackRateTable";
// import MiscPanel from "./MiscPanel";
// import NightCutinPanel from "./NightCutinPanel";

type Props = {
  org: Org;
};

const OrgAnalysisPanel: React.FCX<Props> = ({ className, org }) => {
  const list: TabsProps["list"] = [
    { label: "弾着戦爆発動率", panel: <DayAttackRateTable org={org} /> },
    { label: "触接率", panel: null },
    { label: "夜戦CI率", panel: null },
    { label: "対空", panel: null },
    { label: "その他", panel: null },
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
