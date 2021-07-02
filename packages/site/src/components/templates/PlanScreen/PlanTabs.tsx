import styled from "@emotion/styled";
import { Org } from "@fleethub/core";
import { FLEET_KEYS } from "@fleethub/utils";
import React from "react";

import { Tabs } from "../../molecules";
import { FleetScreen, LandBaseScreen } from "../../organisms";

const height = 40;

type PlanTabsProps = {
  org: Org;
};

const PlanTabs: React.FCX<PlanTabsProps> = ({ className, org }) => {
  const fleetTabs = FLEET_KEYS.map((role) => ({
    className: "fleet-tab-label",
    label: role,
    panel: <FleetScreen fleet={org.get_fleet(role)} role={role} />,
  }));

  const list = [
    ...fleetTabs,
    { label: "基地航空隊", panel: <LandBaseScreen org={org} /> },
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
