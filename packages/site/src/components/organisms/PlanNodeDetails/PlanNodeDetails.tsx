/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Path, PathValue } from "@fh/utils";
import { Stack } from "@mui/material";
import { produce } from "immer";
import set from "lodash/set";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { useOrg } from "../../../hooks";
import {
  filesSlice,
  initalPlanNodeDetailsConfig,
  PlanFileEntity,
  PlanNode,
  PlanNodeDetailsConfig,
} from "../../../store";
import { Flexbox } from "../../atoms";
import { NumberInput } from "../../molecules";
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

  const config = node.config || initalPlanNodeDetailsConfig;

  const bind =
    <P extends Path<PlanNodeDetailsConfig>>(path: P) =>
    (value: PathValue<PlanNodeDetailsConfig, P>) => {
      const next = produce(config, (draft) => {
        set(draft, path, value);
      });

      dispatch(
        filesSlice.actions.updatePlanNode({
          id: plan.id,
          index: plan.nodes.indexOf(node),
          changes: { config: next },
        })
      );
    };

  const playerShip = playerShipId
    ? playerOrg.get_ship_by_id(playerShipId)
    : undefined;
  const enemyShip = enemyShipId
    ? enemyOrg.get_ship_by_id(enemyShipId)
    : undefined;

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
              value={config.player.formation}
              onChange={bind("player.formation")}
            />
            <AirStateSelect
              label={t("AirState")}
              value={config.air_state}
              onChange={bind("air_state")}
            />
            <EngagementSelect
              label={t("Engagement")}
              value={config.engagement}
              onChange={bind("engagement")}
            />
            <NumberInput
              label="a11"
              min={0}
              step={0.1}
              sx={{ width: 80 }}
              value={config.player.external_power_mods.a11}
              onChange={bind("player.external_power_mods.a11")}
            />
          </Flexbox>
          <NightSituationForm
            color="primary"
            value={config.player.night_situation}
            onChange={bind("player.night_situation")}
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
            value={config.enemy.formation}
            onChange={bind("enemy.formation")}
          />
          <NightSituationForm
            color="secondary"
            value={config.enemy.night_situation}
            onChange={bind("enemy.night_situation")}
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
        {playerShip && (
          <ShipCard ship={playerShip} org={playerOrg} visibleMiscStats />
        )}

        {enemyShip && (
          <ShipCard ship={enemyShip} org={enemyOrg} visibleMiscStats />
        )}
      </Flexbox>

      {playerShip && enemyShip && playerOrg && enemyOrg && (
        <WarfareDetails
          playerOrg={playerOrg}
          playerShip={playerShip}
          enemyOrg={enemyOrg}
          enemyShip={enemyShip}
          config={config}
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
