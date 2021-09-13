import {
  AirState,
  Engagement,
  Formation,
  Org,
  Ship,
  Side,
  NightSituation,
  WarfareAnalysisParams,
} from "@fleethub/core";
import React from "react";
import { Flexbox } from "../../atoms";
import WarfareAnalyzer from "../WarfareAnalyzer";

type WarfareDetailsProps = {
  playerOrg: Org;
  playerShip: Ship;
  playerFormation: Formation;
  playerNightSituation: NightSituation;
  enemyOrg: Org;
  enemyShip: Ship;
  enemyFormation: Formation;
  enemyNightSituation: NightSituation;
  air_state: AirState;
  engagement: Engagement;
};

const createArgs = (
  {
    playerOrg,
    playerShip,
    playerFormation,
    playerNightSituation,
    enemyOrg,
    enemyShip,
    enemyFormation,
    enemyNightSituation,
    air_state,
    engagement,
  }: WarfareDetailsProps,
  attackerSide: Side
): [WarfareAnalysisParams, Ship, Ship] | undefined => {
  let attackerOrg: Org;
  let attackerFormation: Formation;
  let attacker_night_situation: NightSituation;
  let attacker: Ship;
  let targetOrg: Org;
  let targetFormation: Formation;
  let target_night_situation: NightSituation;
  let target: Ship;

  if (attackerSide == "Player") {
    attackerOrg = playerOrg;
    attackerFormation = playerFormation;
    attacker_night_situation = playerNightSituation;
    attacker = playerShip;
    targetOrg = enemyOrg;
    targetFormation = enemyFormation;
    target_night_situation = enemyNightSituation;
    target = enemyShip;
  } else {
    attackerOrg = enemyOrg;
    attackerFormation = enemyFormation;
    attacker_night_situation = enemyNightSituation;
    attacker = enemyShip;
    targetOrg = playerOrg;
    targetFormation = playerFormation;
    target_night_situation = playerNightSituation;
    target = playerShip;
  }

  const attacker_env = attackerOrg.create_warfare_ship_environment(
    attacker,
    attackerFormation
  );
  const target_env = targetOrg.create_warfare_ship_environment(
    target,
    targetFormation
  );

  if (!attacker_env || !target_env) {
    return;
  }

  const params: WarfareAnalysisParams = {
    warfare_context: {
      attacker_env,
      target_env,
      air_state,
      engagement,
    },
    attacker_night_situation,
    target_night_situation,
  };

  return [params, attacker, target];
};

const WarfareDetails: React.FCX<WarfareDetailsProps> = ({
  className,
  style,
  ...rest
}) => {
  const args1 = createArgs(rest, "Player");
  const args2 = createArgs(rest, "Enemy");

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
      {args1 && (
        <WarfareAnalyzer
          params={args1[0]}
          attacker={args1[1]}
          target={args1[2]}
        />
      )}
      {args2 && (
        <WarfareAnalyzer
          params={args2[0]}
          attacker={args2[1]}
          target={args2[2]}
        />
      )}
    </Flexbox>
  );
};

export default WarfareDetails;
