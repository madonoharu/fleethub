import { Divider, Stack } from "@mui/material";
import type { Ship } from "fleethub-core";
import React from "react";

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
    <Stack gap={1}>
      <Divider />
      <ShipCard
        ship={enemy}
        css={{ maxWidth: 1178 / 2 - 4 }}
        visibleDetails={false}
        visibleUpdate={false}
      />
      <Flexbox
        gap={1}
        css={{
          "> *": {
            width: "50%",
          },
        }}
      >
        <AttackAnalyzer
          config={state}
          left={ship}
          right={enemy}
          attacker_is_left={true}
        />
        <AttackAnalyzer
          config={state}
          left={ship}
          right={enemy}
          attacker_is_left={false}
        />
      </Flexbox>
    </Stack>
  );
};

type ShipDetailsEnemyListProps = {
  ship: Ship;
  state: ShipDetailsState;
};

const ShipDetailsEnemyList: React.FCX<ShipDetailsEnemyListProps> = ({
  className,
  ship,
  state,
}) => {
  return (
    <Stack className={className} gap={1}>
      {state.enemies.map((id) => (
        <EnemyListItem key={id} id={id} state={state} ship={ship} />
      ))}
    </Stack>
  );
};

export default ShipDetailsEnemyList;
