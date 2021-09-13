import { Ship, Side, WarfareAnalysisParams } from "@fleethub/core";
import { Divider, Stack } from "@mui/material";
import React from "react";

import { useShip } from "../../../hooks";
import { ShipDetailsState, WarfareAnalysisShipParams } from "../../../store";
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

  const createArgs = (side: Side) => {
    let attacker: Ship;
    let attackerParams: WarfareAnalysisShipParams;
    let target: Ship;
    let targetParams: WarfareAnalysisShipParams;

    if (side === "Player") {
      attacker = ship;
      attackerParams = state.player;
      target = enemy;
      targetParams = state.enemy;
    } else {
      attacker = enemy;
      attackerParams = state.enemy;
      target = ship;
      targetParams = state.player;
    }

    const params: WarfareAnalysisParams = {
      warfare_context: {
        attacker_env: attackerParams,
        target_env: targetParams,
        air_state: state.air_state,
        engagement: state.engagement,
      },
      attacker_night_situation: attackerParams,
      target_night_situation: targetParams,
    };

    return { params, attacker, target };
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
        <WarfareAnalyzer {...createArgs("Player")} />
        <WarfareAnalyzer {...createArgs("Enemy")} />
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
