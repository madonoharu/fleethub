import styled from "@emotion/styled";
import { Fleet } from "@fleethub/core";
import { Role } from "@fleethub/utils";
import { EntityId, nanoid } from "@reduxjs/toolkit";
import React from "react";
import { useMemo } from "react";
import { shallowEqual, useDispatch } from "react-redux";

import { Ship } from "../../../../public/pkg";
import { ShipPosition, shipsSlice } from "../../../store";
import FleetShipList from "./FleetShipList";

type FleetScreenProps = {
  fleet: Fleet;
  role: Role;
};

export const useFleetActions = (id: EntityId) => {
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

const FleetScreen: React.FCX<FleetScreenProps> = ({
  className,
  fleet,
  role,
}) => {
  const actions = useFleetActions(fleet.id);

  return (
    <div className={className}>
      <h3>{role}</h3>
      <FleetShipList role={role} fleet={fleet} setShip={actions.setShip} />
    </div>
  );
};

const Memoized = React.memo(
  FleetScreen,
  ({ fleet: prevFleet, ...prevRest }, { fleet: nextFleet, ...nextRest }) =>
    prevFleet.xxh3 === nextFleet.xxh3 && shallowEqual(prevRest, nextRest)
);

export default styled(Memoized)``;
