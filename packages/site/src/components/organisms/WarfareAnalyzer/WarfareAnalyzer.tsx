import {
  Ship,
  WarfareContext,
  ShellingAttackAnalysis,
  Side,
  Org,
  Formation,
  AirState,
  Engagement,
} from "@fleethub/core";
import { Paper } from "@material-ui/core";
import React from "react";
import { useFhCore } from "../../../hooks";
import AttackTabele from "./AttackTabele";

type WarfareAnalyzerProps = {
  playerOrg: Org;
  playerShip: Ship;
  player_formation: Formation;
  enemyShip: Ship;
  enemyOrg: Org;
  enemy_formation: Formation;
  attacker_side: Side;
  air_state: AirState;
  engagement: Engagement;
};

const WarfareAnalyzer: React.FCX<WarfareAnalyzerProps> = ({
  playerOrg,
  playerShip,
  player_formation,
  enemyShip,
  enemyOrg,
  enemy_formation,
  attacker_side,
  air_state,
  engagement,
}) => {
  const { core } = useFhCore();

  const data = core.analyze_warfare(
    playerOrg,
    playerShip,
    player_formation,
    enemyOrg,
    enemyShip,
    enemy_formation,
    attacker_side,
    air_state,
    engagement
  );

  if (!data) return null;

  return (
    <Paper
      css={{
        minHeight: 24 * 8,
        padding: 8,
      }}
    >
      <AttackTabele data={data} />
    </Paper>
  );
};

export default WarfareAnalyzer;
