import {
  Comp,
  Ship,
  Side,
  WarfareContext,
  ShipEnvironment,
} from "fleethub-core";
import React from "react";

import { StepConfig } from "../../../store";
import { Flexbox } from "../../atoms";
import WarfareAnalyzer from "../WarfareAnalyzer";

type WarfareDetailsProps = {
  playerComp: Comp;
  playerShip: Ship;
  enemyComp: Comp;
  enemyShip: Ship;
  config: StepConfig;
};

const createAnalyzerProps = (
  { playerComp, playerShip, enemyComp, enemyShip, config }: WarfareDetailsProps,
  attackerSide: Side
) => {
  const playerEnv = {
    ...playerComp.create_warfare_ship_environment(
      playerShip,
      config.player.formation
    ),
    ...config.player,
  };

  const enemyEnv = {
    ...enemyComp.create_warfare_ship_environment(
      enemyShip,
      config.enemy.formation
    ),
    ...config.enemy,
  };

  let attacker: Ship;
  let attacker_env: ShipEnvironment;
  let target: Ship;
  let target_env: ShipEnvironment;

  if (attackerSide == "Player") {
    attacker = playerShip;
    attacker_env = playerEnv;
    target = enemyShip;
    target_env = enemyEnv;
  } else {
    attacker = enemyShip;
    attacker_env = enemyEnv;
    target = playerShip;
    target_env = playerEnv;
  }

  const ctx: WarfareContext = {
    attacker_env,
    target_env,
    air_state: config.air_state,
    engagement: config.engagement,
  };

  return { ctx, attacker, target };
};

const WarfareDetails: React.FCX<WarfareDetailsProps> = ({
  className,
  style,
  ...rest
}) => {
  const props1 = createAnalyzerProps(rest, "Player");
  const props2 = createAnalyzerProps(rest, "Enemy");

  return (
    <Flexbox
      className={className}
      style={style}
      gap={1}
      css={{
        "> *": {
          width: "50%",
        },
      }}
    >
      {props1 && <WarfareAnalyzer {...props1} />}
      {props2 && <WarfareAnalyzer {...props2} />}
    </Flexbox>
  );
};

export default WarfareDetails;
