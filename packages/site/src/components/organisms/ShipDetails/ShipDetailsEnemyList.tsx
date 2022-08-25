import { Divider, Stack } from "@mui/material";
import {
  Ship,
  Side,
  AttackAnalyzerConfig,
  AttackAnalyzerShipConfig,
} from "fleethub-core";
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

  const createProps = (side: Side) => {
    let attacker: Ship;
    let attackerConfig: AttackAnalyzerShipConfig | undefined;
    let target: Ship;
    let targetConfig: AttackAnalyzerShipConfig | undefined;

    if (side === "Player") {
      attacker = ship;
      attackerConfig = state.left;
      target = enemy;
      targetConfig = state.right;
    } else {
      attacker = enemy;
      attackerConfig = state.right;
      target = ship;
      targetConfig = state.left;
    }

    const config: AttackAnalyzerConfig = {
      air_state: state.air_state,
      engagement: state.engagement,
      attacker: attackerConfig,
      target: targetConfig,
    };

    return { config, attacker, target };
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
        <AttackAnalyzer {...createProps("Player")} />
        <AttackAnalyzer {...createProps("Enemy")} />
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
