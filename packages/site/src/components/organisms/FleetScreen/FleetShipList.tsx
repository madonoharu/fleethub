import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import { Dict, Role, SHIP_KEYS, ShipKey } from "@fleethub/utils";
import { EntityId } from "@reduxjs/toolkit";
import React, { useCallback } from "react";

import { ShipPosition } from "../../../store";
import ShipBox from "../ShipBox";

type FleetShipListProps = {
  role: Role;
  ships: Dict<ShipKey, EntityId>;
  size?: number;
  setShip?: (position: Omit<ShipPosition, "id">, ship: Ship) => void;
};

type ListItemProps = Pick<FleetShipListProps, "role" | "setShip"> & {
  id?: EntityId;
  shipKey: ShipKey;
};

const ListItem: React.FC<ListItemProps> = ({ role, shipKey, id, setShip }) => {
  const handleShipChange = useCallback(
    (ship: Ship) => {
      setShip?.({ role, key: shipKey }, ship);
    },
    [role, shipKey, setShip]
  );

  return <ShipBox id={id} onShipChange={handleShipChange} />;
};

const FleetShipList: React.FCX<FleetShipListProps> = React.memo(
  ({ className, role, ships, size = 6, setShip }) => {
    return (
      <div className={className}>
        {SHIP_KEYS.filter((_, index) => index + 1 <= size).map((key) => (
          <ListItem
            key={key}
            role={role}
            shipKey={key}
            id={ships[key]}
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
