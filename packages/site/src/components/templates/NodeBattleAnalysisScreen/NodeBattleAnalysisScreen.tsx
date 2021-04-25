import { css } from "@emotion/react";
import {
  BattleContextImpl,
  BattleFleet,
  BattleFleetImpl,
  Engagement,
  Engagements,
  Formation,
  Plan,
  ShellingImpl,
  Ship,
} from "@fleethub/core";
import { Typography } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";

import { useImmerFields } from "../../../hooks";
import { Select, ShipBanner } from "../../molecules";
import { AttackAnalysisScreen, FormationSelect, Table } from "../../organisms";
import BattleFleetShipSelect from "./BattleFleetShipSelect";

type Props = {
  plan: Plan;
  enemy: BattleFleet;
};

type NodeBattleState = {
  engagement: Engagement;
  player: {
    ship: Ship;
    formation: Formation;
  };
  enemy: {
    ship: Ship;
    formation: Formation;
  };
};

const NodeBattleAnalysisScreen: React.FCX<Props> = ({ plan, enemy }) => {
  const { t } = useTranslation("terms");
  const { state, getHandlers } = useImmerFields<NodeBattleState>({
    engagement: "Parallel",
    player: {
      ship: plan.main.ships[0],
      formation: "LineAhead",
    },
    enemy: {
      ship: enemy.main.ships[0],
      formation: "LineAhead",
    },
  });

  const player = BattleFleetImpl.fromPlan(
    plan,
    state.player.formation,
    "Player"
  );

  const battleContext = new BattleContextImpl({
    nodeType: "NightBattle",
    airState: "AirSupremacy",
    engagement: state.engagement,
    player,
    enemy,
  });

  const attacker = state.player.ship;
  const defender = state.enemy.ship;

  return (
    <div>
      <Select
        options={Engagements}
        {...getHandlers("engagement")}
        getOptionLabel={t}
      />

      <div
        css={css`
          display: flex;
          justify-content: space-between;
          > * {
            margin: 8px;
          }
        `}
      >
        <div>
          <FormationSelect
            combined={plan.isCombined}
            {...getHandlers("player.formation")}
          />
          <BattleFleetShipSelect
            fleet={player}
            {...getHandlers("player.ship")}
          />
        </div>
        <Typography>VS</Typography>
        <div>
          <FormationSelect
            combined={enemy.isCombined}
            {...getHandlers("enemy.formation")}
          />
          <BattleFleetShipSelect fleet={enemy} {...getHandlers("enemy.ship")} />
        </div>
      </div>

      <AttackAnalysisScreen
        ctx={battleContext}
        attacker={attacker}
        defender={defender}
      />
    </div>
  );
};

export default NodeBattleAnalysisScreen;
