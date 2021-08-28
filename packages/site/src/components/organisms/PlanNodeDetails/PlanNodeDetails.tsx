import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { DamageState, Formation, MoraleState } from "@fleethub/core";
import { Container } from "@material-ui/core";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { useOrg } from "../../../hooks";
import { filesSlice, PlanFileEntity, PlanNode } from "../../../store";
import { Flexbox } from "../../atoms";
import AirStateSelect from "../AirStateSelect";
import EngagementSelect from "../EngagementSelect";
import FormationSelect from "../FormationSelect";
import ShipCard from "../ShipCard";
import WarfareAnalyzer from "../WarfareAnalyzer";
import OrgShipSelect from "./OrgShipSelect";

export type NodeAnalyzerShipConfigs = {
  damage_state: DamageState;
  morale_state: MoraleState;
};

type PlanNodeDetailsProps = {
  plan: PlanFileEntity;
  node: PlanNode;
};

const PlanNodeDetails: React.FCX<PlanNodeDetailsProps> = ({
  className,
  style,
  plan,
  node,
}) => {
  const { org: playerOrg } = useOrg(plan.org);
  const { org: enemyOrg } = useOrg(node.org);
  const dispatch = useDispatch();
  const { t } = useTranslation("common");

  const [playerShipId, setPlayerShipId] = useState<string | undefined>(
    playerOrg?.get_ship_entity_id("Main", "s1")
  );
  const [enemyShipId, setEnemyShipId] = useState<string | undefined>(
    enemyOrg?.get_ship_entity_id("Main", "s1")
  );

  if (!playerOrg || !enemyOrg) return null;

  const update = (changes: Partial<PlanNode>) => {
    dispatch(
      filesSlice.actions.updatePlanNode({
        id: plan.id,
        index: plan.nodes.indexOf(node),
        changes,
      })
    );
  };

  const playerShip = playerShipId
    ? playerOrg.get_ship_by_id(playerShipId)
    : undefined;
  const enemyShip = enemyShipId
    ? enemyOrg.get_ship_by_id(enemyShipId)
    : undefined;

  const player_formation =
    node.player_formation || (playerOrg.default_formation() as Formation);
  const enemy_formation =
    node.enemy_formation || (enemyOrg.default_formation() as Formation);

  return (
    <div className={className}>
      <Flexbox
        justifyContent="space-between"
        alignItems="flex-start"
        css={{ maxWidth: 720 }}
      >
        <OrgShipSelect
          org={playerOrg}
          value={playerShipId}
          onSelect={setPlayerShipId}
        />

        <OrgShipSelect
          enemy
          org={enemyOrg}
          value={enemyShipId}
          onSelect={setEnemyShipId}
        />
      </Flexbox>

      <Flexbox gap={1} css={{ maxWidth: 720 }}>
        <FormationSelect
          color="primary"
          label={t("Formation")}
          combined={playerOrg.is_combined()}
          value={player_formation}
          onChange={(player_formation) => update({ player_formation })}
        />
        <AirStateSelect
          label={t("AirState")}
          value={node.air_state || "AirSupremacy"}
          onChange={(air_state) => update({ air_state })}
        />
        <EngagementSelect
          label={t("Engagement")}
          value={node.engagement || "Parallel"}
          onChange={(engagement) => update({ engagement })}
        />

        <FormationSelect
          css={{ marginLeft: "auto" }}
          label={t("Formation")}
          color="secondary"
          combined={enemyOrg.is_combined()}
          value={enemy_formation}
          onChange={(enemy_formation) => update({ enemy_formation })}
        />
      </Flexbox>

      <Flexbox
        gap={1}
        css={{
          width: "100%",
          "> *": {
            width: "50%",
          },
        }}
      >
        {playerShip && <ShipCard ship={playerShip} />}

        {enemyShip && <ShipCard ship={enemyShip} />}
      </Flexbox>

      {playerShip && enemyShip && playerOrg && enemyOrg && (
        <WarfareAnalyzer
          playerOrg={playerOrg}
          playerShip={playerShip}
          player_formation={player_formation}
          enemyOrg={enemyOrg}
          enemyShip={enemyShip}
          enemy_formation={enemy_formation}
          attacker_side="Player"
          air_state={node.air_state || "AirSupremacy"}
          engagement={node.engagement || "Parallel"}
        />
      )}
    </div>
  );
};

export default styled(PlanNodeDetails)`
  > * {
    margin-top: 8px;
  }
`;
