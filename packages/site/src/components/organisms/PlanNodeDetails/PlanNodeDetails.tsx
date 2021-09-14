import styled from "@emotion/styled";
import { NightSituation } from "@fh/core";
import { Stack } from "@mui/material";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { useOrg } from "../../../hooks";
import { filesSlice, PlanFileEntity, PlanNode } from "../../../store";
import { Flexbox } from "../../atoms";
import AirStateSelect from "../AirStateSelect";
import EngagementSelect from "../EngagementSelect";
import FormationSelect from "../FormationSelect";
import NightSituationForm from "../NightSituationForm";
import ShipCard from "../ShipCard";
import OrgShipSelect from "./OrgShipSelect";
import WarfareDetails from "./WarfareDetails";

type PlanNodeDetailsProps = {
  plan: PlanFileEntity;
  node: PlanNode;
};

const initalNightSituation: NightSituation = {
  night_contact_rank: null,
  searchlight: false,
  starshell: false,
};

const PlanNodeDetails: React.FCX<PlanNodeDetailsProps> = ({
  className,
  style,
  plan,
  node,
}) => {
  const { t } = useTranslation("common");
  const dispatch = useDispatch();

  const { org: playerOrg } = useOrg(plan.org);
  const { org: enemyOrg } = useOrg(node.org);

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
    node.player_formation || playerOrg.default_formation();
  const enemy_formation = node.enemy_formation || enemyOrg.default_formation();

  const playerNightSituation =
    node.playerNightSituation || initalNightSituation;
  const enemyNightSituation = node.enemyNightSituation || initalNightSituation;

  return (
    <div className={className} style={style}>
      <Flexbox
        justifyContent="space-between"
        alignItems="flex-start"
        css={{ maxWidth: 720 }}
      ></Flexbox>

      <Flexbox
        gap={1}
        css={{
          "> *": {
            width: "50%",
          },
        }}
      >
        <Stack gap={1}>
          <OrgShipSelect
            org={playerOrg}
            value={playerShipId}
            onSelect={setPlayerShipId}
          />
          <Flexbox gap={1}>
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
          </Flexbox>
          <NightSituationForm
            color="primary"
            value={playerNightSituation}
            onChange={(playerNightSituation) =>
              update({ playerNightSituation })
            }
          />
        </Stack>

        <Stack gap={1}>
          <OrgShipSelect
            enemy
            org={enemyOrg}
            value={enemyShipId}
            onSelect={setEnemyShipId}
          />
          <FormationSelect
            css={{ display: "block" }}
            label={t("Formation")}
            color="secondary"
            combined={enemyOrg.is_combined()}
            value={enemy_formation}
            onChange={(enemy_formation) => update({ enemy_formation })}
          />
          <NightSituationForm
            color="secondary"
            value={enemyNightSituation}
            onChange={(enemyNightSituation) => update({ enemyNightSituation })}
          />
        </Stack>
      </Flexbox>

      <Flexbox
        gap={1}
        css={{
          "> *": {
            width: "50%",
          },
        }}
      >
        {playerShip && <ShipCard ship={playerShip} visibleMiscStats />}

        {enemyShip && <ShipCard ship={enemyShip} visibleMiscStats />}
      </Flexbox>

      {playerShip && enemyShip && playerOrg && enemyOrg && (
        <WarfareDetails
          playerOrg={playerOrg}
          playerShip={playerShip}
          playerFormation={player_formation}
          playerNightSituation={playerNightSituation}
          enemyOrg={enemyOrg}
          enemyShip={enemyShip}
          enemyFormation={enemy_formation}
          enemyNightSituation={enemyNightSituation}
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
