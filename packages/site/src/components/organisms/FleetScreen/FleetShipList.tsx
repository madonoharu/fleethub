import styled from "@emotion/styled";
import { ShipKey } from "@fh/utils";
import { Fleet } from "fleethub-core";
import React from "react";

import ShipBox from "../ShipBox";

type FleetShipListProps = {
  fleet: Fleet;
};

const FleetShipList: React.FCX<FleetShipListProps> = React.memo(
  ({ className, fleet }) => {
    return (
      <div className={className}>
        {(fleet.ship_keys() as ShipKey[]).map((key) => (
          <ShipBox
            key={key}
            ship={fleet.get_ship(key)}
            position={{
              tag: "fleets",
              id: fleet.id,
              key,
            }}
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
