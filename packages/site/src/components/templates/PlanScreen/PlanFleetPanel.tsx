import { FleetKey } from "@fh/utils";
import { Stack } from "@mui/material";
import { Org } from "fleethub-core";
import React from "react";
import { FleetScreen, FleetInfoPanel } from "../../organisms";

type PlanFleetPanelProps = {
  org: Org;
  fleetKey: FleetKey;
};

const PlanFleetPanel: React.FCX<PlanFleetPanelProps> = ({
  className,
  style,
  org,
  fleetKey,
}) => {
  const fleet = org.clone_fleet(fleetKey);

  return (
    <Stack className={className} style={style} gap={1}>
      <FleetScreen fleet={fleet} />
      <FleetInfoPanel org={org} fleetKey={fleetKey} />
    </Stack>
  );
};

export default PlanFleetPanel;
