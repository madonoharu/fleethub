import styled from "@emotion/styled";
import { Plan } from "@fleethub/core";
import { ROLES } from "@fleethub/utils";
import React from "react";

import { Tabs } from "../../molecules";
import { FleetScreen, LandBaseScreen } from "../../organisms";

const height = 40;

type PlanTabsProps = {
  plan: Plan;
};

const PlanTabs: React.FCX<PlanTabsProps> = ({ className, plan }) => {
  const fleetTabs = ROLES.map((role) => ({
    className: "fleet-tab-label",
    label: role,
    panel: <FleetScreen fleet={plan.get_fleet(role)} role={role} />,
  }));

  const list = [
    ...fleetTabs,
    { label: "基地航空隊", panel: <LandBaseScreen plan={plan} /> },
    { label: "画像出力", panel: null },
  ];

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
    }
  }
`;
