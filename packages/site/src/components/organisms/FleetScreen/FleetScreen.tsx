import styled from "@emotion/styled";
import { Fleet } from "@fleethub/core";
import React from "react";
import { shallowEqual } from "react-redux";

import FleetShipList from "./FleetShipList";

type FleetScreenProps = {
  fleet: Fleet;
};

const FleetScreen: React.FCX<FleetScreenProps> = ({ className, fleet }) => {
  return (
    <div className={className}>
      <FleetShipList fleet={fleet} />
    </div>
  );
};

const Memoized = React.memo(
  FleetScreen,
  ({ fleet: prevFleet, ...prevRest }, { fleet: nextFleet, ...nextRest }) =>
    prevFleet.xxh3 === nextFleet.xxh3 && shallowEqual(prevRest, nextRest)
);

export default styled(Memoized)``;
