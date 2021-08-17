import styled from "@emotion/styled";
import { Fleet } from "@fleethub/core";
import { SHIP_KEYS } from "@fleethub/utils";
import React from "react";

import ShipBox from "../ShipBox";

type FleetShipListProps = {
  fleet: Fleet;
  size?: number;
};

const FleetShipList: React.FCX<FleetShipListProps> = React.memo(
  ({ className, fleet, size = 6 }) => {
    return (
      <div className={className}>
        {SHIP_KEYS.filter((_, index) => index < size).map((key) => (
          <ShipBox
            key={key}
            ship={fleet.get_ship(key)}
            position={{ id: fleet.id, key }}
          />
        ))}
      </div>
    );
  }
);

export default styled(FleetShipList)`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
`;
