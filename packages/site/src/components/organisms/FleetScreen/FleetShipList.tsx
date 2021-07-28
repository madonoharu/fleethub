import styled from "@emotion/styled";
import { Fleet, Ship } from "@fleethub/core";
import { SHIP_KEYS, ShipKey } from "@fleethub/utils";
import React, { useCallback } from "react";

import { ShipPosition } from "../../../store";
import ShipBox from "../ShipBox";

type FleetShipListProps = {
  fleet: Fleet;
  size?: number;
  setShip?: (position: Omit<ShipPosition, "id">, ship: Ship) => void;
};

type ListItemProps = Pick<FleetShipListProps, "setShip"> & {
  ship?: Ship;
  shipKey: ShipKey;
};

const ListItem: React.FC<ListItemProps> = ({ shipKey, ship, setShip }) => {
  const handleShipChange = useCallback(
    (ship: Ship) => {
      setShip?.({ key: shipKey }, ship);
    },
    [shipKey, setShip]
  );

  return <ShipBox ship={ship} onShipChange={handleShipChange} />;
};

const FleetShipList: React.FCX<FleetShipListProps> = React.memo(
  ({ className, fleet, size = 6, setShip }) => {
    return (
      <div className={className}>
        {SHIP_KEYS.filter((_, index) => index < size).map((key) => (
          <ListItem
            key={key}
            shipKey={key}
            ship={fleet.get_ship(key)}
            setShip={setShip}
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
