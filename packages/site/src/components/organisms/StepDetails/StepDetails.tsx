/** @jsxImportSource @emotion/react */
import { Path, PathValue } from "@fh/utils";
import { Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { produce } from "immer";
import set from "lodash/set";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { useOrg } from "../../../hooks";
import {
  initalStepConfig,
  PlanFileEntity,
  StepEntity,
  StepConfig,
  stepsSlices,
} from "../../../store";
import { Flexbox } from "../../atoms";
import { NumberInput, Tabs } from "../../molecules";
import AirStateSelect from "../AirStateSelect";
import EngagementSelect from "../EngagementSelect";
import FormationSelect from "../FormationSelect";
import NightSituationForm from "../NightSituationForm";
import ShipCard from "../ShipCard";
import CompShipList from "./CompShipList";
import SimulatorResultTable from "./SimulatorResultTable";
import WarfareDetails from "./WarfareDetails";

const GridContainer = styled("div")`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

type StepDetailsProps = {
  plan: PlanFileEntity;
  step: StepEntity;
};

const StepDetails: React.FCX<StepDetailsProps> = ({
  className,
  style,
  plan,
  step,
}) => {
  const { t } = useTranslation("common");
  const dispatch = useDispatch();

  const { org: playerOrg } = useOrg(plan.org);
  const { org: enemyOrg } = useOrg(step.org);

  const [playerShipId, setPlayerShipId] = useState<string | undefined>(
    playerOrg?.get_ship_entity_id("Main", "s1")
  );
  const [enemyShipId, setEnemyShipId] = useState<string | undefined>(
    enemyOrg?.get_ship_entity_id("Main", "s1")
  );

  if (!playerOrg || !enemyOrg) return null;
  const config = step.config || initalStepConfig;

  const bind =
    <P extends Path<StepConfig>>(path: P) =>
    (value: PathValue<StepConfig, P>) => {
      const next = produce(config, (draft) => {
        set(draft, path, value);
      });

      dispatch(
        stepsSlices.actions.update({
          id: step.id,
          changes: { config: next },
        })
      );
    };

  const playerComp = playerOrg.create_comp_by_key("f1");
  const enemyComp = enemyOrg.create_comp_by_key("f1");

  const playerShip = playerShipId
    ? playerOrg.get_ship_by_id(playerShipId)
    : undefined;
  const enemyShip = enemyShipId
    ? enemyOrg.get_ship_by_id(enemyShipId)
    : undefined;

  return (
    <div className={className} style={style}>
      <Typography variant="subtitle1">{step.name}</Typography>
      <GridContainer>
        <CompShipList
          comp={playerComp}
          selectedShip={playerShipId}
          onShipSelect={setPlayerShipId}
        />
        <CompShipList
          comp={enemyComp}
          selectedShip={enemyShipId}
          onShipSelect={setEnemyShipId}
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
        <FormationSelect
          css={{ width: "fit-content" }}
          label={t("Formation")}
          color="secondary"
          combined={enemyOrg.is_combined()}
          value={config.enemy.formation}
          onChange={bind("enemy.formation")}
        />
        <NightSituationForm
          color="primary"
          value={config.player.night_situation}
          onChange={bind("player.night_situation")}
        />
        <NightSituationForm
          color="secondary"
          value={config.enemy.night_situation}
          onChange={bind("enemy.night_situation")}
        />
        {playerShip && (
          <ShipCard ship={playerShip} org={playerOrg} visibleMiscStats />
        )}

        {enemyShip && (
          <ShipCard ship={enemyShip} org={enemyOrg} visibleMiscStats />
        )}
      </GridContainer>

      <Tabs
        list={[
          {
            label: t("Details"),
            panel: playerShip && enemyShip && (
              <WarfareDetails
                playerOrg={playerOrg}
                playerShip={playerShip}
                enemyOrg={enemyOrg}
                enemyShip={enemyShip}
                config={config}
              />
            ),
          },
          {
            label: "砲撃支援シミュレータ",
            panel: (
              <SimulatorResultTable
                player={playerComp}
                enemy={enemyComp}
                config={config}
                times={10000}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default styled(StepDetails)`
  margin-bottom: 400px;
`;
