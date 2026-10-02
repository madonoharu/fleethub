import { ShipKey } from "@fh/utils";
import { Fleet } from "fleethub-core";
import React from "react";

import ShipBox from "../ShipBox";
import { cn } from "../../../styles";

type FleetShipListProps = {
  fleet: Fleet;
};

const FleetShipList: React.FCX<FleetShipListProps> = React.memo(({ className, fleet }) => {
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
});

export default ({ className, ...props }: React.ComponentProps<typeof FleetShipList>) => (
  <FleetShipList
    {...props}
    className={cn(
      "grid [grid-gap:8px] [grid-template-columns:repeat(auto-fill,_minmax(400px,_1fr))]",
      className,
    )}
  />
);
