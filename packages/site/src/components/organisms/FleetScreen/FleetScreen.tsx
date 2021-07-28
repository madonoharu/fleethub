import styled from "@emotion/styled";
import { Fleet, Ship } from "@fleethub/core";
import { nanoid } from "@reduxjs/toolkit";
import React from "react";
import { useMemo } from "react";
import { shallowEqual, useDispatch } from "react-redux";

import { ShipPosition, shipsSlice } from "../../../store";
import FleetShipList from "./FleetShipList";

type FleetScreenProps = {
  fleet: Fleet;
};

export const useFleetActions = (id: string) => {
  const dispatch = useDispatch();

  return useMemo(
    () => ({
      setShip: (position: Omit<ShipPosition, "id">, ship: Ship) => {
        dispatch(
          shipsSlice.actions.add(
            { id: nanoid(), ship_id: ship.ship_id },
            { ...position, id }
          )
        );
      },
    }),
    [dispatch, id]
  );
};

const FleetScreen: React.FCX<FleetScreenProps> = ({ className, fleet }) => {
  const actions = useFleetActions(fleet.id);

  return (
    <div className={className}>
      <FleetShipList fleet={fleet} setShip={actions.setShip} />
    </div>
  );
};

const Memoized = React.memo(
  FleetScreen,
  ({ fleet: prevFleet, ...prevRest }, { fleet: nextFleet, ...nextRest }) =>
    prevFleet.xxh3 === nextFleet.xxh3 && shallowEqual(prevRest, nextRest)
);

export default styled(Memoized)``;
