import { Fleet, FleetKey, FleetState, PlanState } from "@fleethub/core";
import React from "react";

import { FleetEditor } from "../../../components";
import { Update } from "../../../utils";

type Props = {
  fleet: Fleet;
  fleetKey: FleetKey;
  updatePlan: Update<PlanState>;
};

const FleetTabPanel: React.FC<Props> = ({ fleet, fleetKey, updatePlan }) => {
  const updateFleet: Update<FleetState> = React.useCallback(
    (recipe) => {
      updatePlan((draft) => {
        const fleetState = draft[fleetKey] || (draft[fleetKey] = {});
        recipe(fleetState);
      });
    },
    [fleetKey, updatePlan]
  );

  return <FleetEditor fleet={fleet} update={updateFleet} />;
};

export default FleetTabPanel;
