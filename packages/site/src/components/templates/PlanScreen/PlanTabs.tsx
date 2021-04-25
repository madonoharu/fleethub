import styled from "@emotion/styled";
import { ROLES } from "@fleethub/utils";
import { Typography } from "@material-ui/core";
import { EntityId } from "@reduxjs/toolkit";
import React from "react";

import { Tabs } from "../../molecules";
import { FleetScreen } from "../../organisms";

const height = 40;

type PlanTabsProps = {
  id: EntityId;
};

const PlanTabs: React.FCX<PlanTabsProps> = ({ className, id }) => {
  const fleetTabs = ROLES.map((role) => ({
    className: "fleet-tab-label",
    label: role,
    panel: <FleetScreen id={id} role={role} />,
  }));

  const list = [
    ...fleetTabs,
    { label: "基地航空隊", panel: null },
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
