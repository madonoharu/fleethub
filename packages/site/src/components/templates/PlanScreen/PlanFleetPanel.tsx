import { Org } from "@fh/core";
import { FleetKey } from "@fh/utils";
import React from "react";
import { FleetScreen, FleetInfoPanel } from "../../organisms";

type PlanFleetPanelProps = {
  org: Org;
  fleetKey: FleetKey;
};

const PlanFleetPanel: React.FCX<PlanFleetPanelProps> = ({ org, fleetKey }) => {
  const fleet = org.clone_fleet(fleetKey);

  return (
    <div>
      <FleetScreen fleet={fleet} />
      <FleetInfoPanel org={org} fleetKey={fleetKey} />
    </div>
  );
};

export default PlanFleetPanel;
