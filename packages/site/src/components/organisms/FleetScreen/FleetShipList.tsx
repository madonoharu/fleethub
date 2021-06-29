import styled from "@emotion/styled";
import { Fleet, Ship } from "@fleethub/core";
import { Role, SHIP_KEYS, ShipKey } from "@fleethub/utils";
import React, { useCallback } from "react";

import { ShipPosition } from "../../../store";
import ShipBox from "../ShipBox";

type FleetShipListProps = {
  role: Role;
  fleet: Fleet;
  size?: number;
  setShip?: (position: Omit<ShipPosition, "id">, ship: Ship) => void;
};

type ListItemProps = Pick<FleetShipListProps, "role" | "setShip"> & {
  ship?: Ship;
  shipKey: ShipKey;
};

const ListItem: React.FC<ListItemProps> = ({
  role,
  shipKey,
  ship,
  setShip,
}) => {
  const handleShipChange = useCallback(
    (ship: Ship) => {
      setShip?.({ role, key: shipKey }, ship);
    },
    [role, shipKey, setShip]
  );

  return <ShipBox ship={ship} onShipChange={handleShipChange} />;
};

const FleetShipList: React.FCX<FleetShipListProps> = React.memo(
  ({ className, role, fleet, size = 6, setShip }) => {
    return (
      <div className={className}>
        {SHIP_KEYS.filter((_, index) => index < size).map((key) => (
          <ListItem
            key={key}
            role={role}
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
  margin: 8px;
  width: 1000px;

  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
`;
