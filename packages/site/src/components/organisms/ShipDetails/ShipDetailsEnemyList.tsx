import { Divider } from "@mui/material";
import type { Ship } from "fleethub-core";
import React from "react";

import { cn } from "../../../styles/cn";
import { useShip } from "../../../hooks";
import { ShipDetailsState } from "../../../store";
import { Flexbox } from "../../atoms";
import AttackAnalyzer from "../AttackAnalyzer";
import ShipCard from "../ShipCard";

type EnemyListItemProps = {
  ship: Ship;
  id: string;
  state: ShipDetailsState;
};

const EnemyListItem: React.FCX<EnemyListItemProps> = ({ id, state, ship }) => {
  const enemy = useShip(id);

  if (!enemy) return null;

  return (
    <div className="flex flex-col gap-2">
      <Divider />
      <ShipCard
        ship={enemy}
        className="max-w-[585px]"
        visibleDetails={false}
        visibleUpdate={false}
      />
      <Flexbox className="gap-2 [&>*]:w-1/2">
        <AttackAnalyzer config={state} left={ship} right={enemy} attacker_is_left={true} />
        <AttackAnalyzer config={state} left={ship} right={enemy} attacker_is_left={false} />
      </Flexbox>
    </div>
  );
};

type ShipDetailsEnemyListProps = {
  ship: Ship;
  state: ShipDetailsState;
};

const ShipDetailsEnemyList: React.FCX<ShipDetailsEnemyListProps> = ({ className, ship, state }) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {state.enemies.map((id) => (
        <EnemyListItem key={id} id={id} state={state} ship={ship} />
      ))}
    </div>
  );
};

export default ShipDetailsEnemyList;
