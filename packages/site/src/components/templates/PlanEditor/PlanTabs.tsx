import styled from "@emotion/styled";
import { Fleet, FleetKey, FleetState, Plan, PlanState } from "@fleethub/core";
import { Typography } from "@material-ui/core";
import React from "react";

import { Swappable, Tabs } from "../../../components";
import { Update } from "../../../utils";
import FleetTabPanel from "./FleetTabPanel";
import GkcoiTabPanel from "./GkcoiTabPanel";
import LandBaseTabPanel from "./LandBaseTabPanel";

const height = 40;

type FleetTabLabelProps = {
  fleet: Fleet;
  fleetKey: FleetKey;
  updatePlan: Update<PlanState>;
};

const FleetTabLabel: React.FCX<FleetTabLabelProps> = ({
  className,
  fleet,
  fleetKey,
  updatePlan,
}) => {
  const setState = (next: FleetState) => {
    updatePlan((draft) => {
      draft[fleetKey] = next;
    });
  };

  const label = fleetKey.replace("f", "第");

  return (
    <Swappable
      className={className}
      type="fleet"
      state={fleet.state}
      setState={setState}
    >
      <Typography>{label}</Typography>
    </Swappable>
  );
};

const StyledFleetTabLabel = styled(FleetTabLabel)`
  width: 64px;
  margin: 2px;
  p {
    line-height: ${height - 4}px;
  }
`;

type Props = {
  id: string;
  plan: Plan;
  update: Update<PlanState>;
};

const PlanTabs: React.FCX<Props> = ({ className, id, plan, update }) => {
  const getTabItem = (fleetKey: FleetKey) => ({
    className: "fleet-tab-label",
    label: (
      <StyledFleetTabLabel
        fleetKey={fleetKey}
        fleet={plan[fleetKey]}
        updatePlan={update}
      />
    ),
    panel: (
      <FleetTabPanel
        fleet={plan[fleetKey]}
        fleetKey={fleetKey}
        updatePlan={update}
      />
    ),
  });

  return (
    <Tabs
      className={className}
      list={[
        getTabItem("f1"),
        getTabItem("f2"),
        getTabItem("f3"),
        getTabItem("f4"),
        {
          label: "基地",
          panel: <LandBaseTabPanel plan={plan} update={update} />,
        },
        {
          label: "画像出力(gkcoi)",
          panel: <GkcoiTabPanel id={id} plan={plan} />,
        },
      ]}
    />
  );
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
