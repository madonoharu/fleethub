import { Divider, Stack } from "@mui/material";
import { Ship, Side, WarfareContext, ShipEnvironment } from "fleethub-core";
import React from "react";

import { useShip } from "../../../hooks";
import { ShipDetailsState } from "../../../store";
import { Flexbox } from "../../atoms";
import ShipCard from "../ShipCard";
import WarfareAnalyzer from "../WarfareAnalyzer";

type EnemyListItemProps = {
  ship: Ship;
  id: string;
  state: ShipDetailsState;
};

const EnemyListItem: React.FCX<EnemyListItemProps> = ({ id, state, ship }) => {
  const enemy = useShip(id);

  if (!enemy) return null;

  const createProps = (side: Side) => {
    let attacker: Ship;
    let attacker_env: ShipEnvironment;
    let target: Ship;
    let target_env: ShipEnvironment;

    if (side === "Player") {
      attacker = ship;
      attacker_env = state.player;
      target = enemy;
      target_env = state.enemy;
    } else {
      attacker = enemy;
      attacker_env = state.enemy;
      target = ship;
      target_env = state.player;
    }

    const ctx: WarfareContext = {
      air_state: state.air_state,
      engagement: state.engagement,
      attacker_env,
      target_env,
    };

    return { ctx, attacker, target };
  };

  return (
    <Stack gap={1}>
      <Divider />
      <ShipCard ship={enemy} css={{ maxWidth: 1178 / 2 - 4 }} />
      <Flexbox
        gap={1}
        css={{
          "> *": {
            width: "50%",
          },
        }}
      >
        <WarfareAnalyzer {...createProps("Player")} />
        <WarfareAnalyzer {...createProps("Enemy")} />
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
