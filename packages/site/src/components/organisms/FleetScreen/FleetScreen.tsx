import styled from "@emotion/styled";
import { Role } from "@fleethub/utils";
import { EntityId } from "@reduxjs/toolkit";
import React from "react";

import { useFleet } from "../../../hooks";
import FleetShipList from "./FleetShipList";

type FleetScreenProps = {
  id: EntityId;
  role: Role;
};

const FleetScreen: React.FCX<FleetScreenProps> = React.memo(
  ({ className, id, role }) => {
    const { entity, setShip } = useFleet(id);

    if (!entity) {
      return null;
    }

    return (
      <div className={className}>
        <h3>{role}</h3>
        <FleetShipList role={role} ships={entity[role]} setShip={setShip} />
      </div>
    );
  }
);

export default styled(FleetScreen)``;
