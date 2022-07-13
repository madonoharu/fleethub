import { FleetKey, Path, PathValue } from "@fh/utils";
import { Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { produce } from "immer";
import set from "lodash/set";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import { useAppDispatch, useOrg } from "../../../hooks";
import {
  initialStepConfig,
  PlanEntity,
  StepEntity,
  StepConfig,
  stepsSlice,
  orgsSlice,
} from "../../../store";
import { Flexbox } from "../../atoms";
import { Tabs } from "../../molecules";
import AirStateSelect from "../AirStateSelect";
import CompShipList from "../CompShipList";
import CustomModifiersDialog from "../CustomModifiersDialog";
import EngagementSelect from "../EngagementSelect";
import FormationSelect from "../FormationSelect";
import NightConditionsForm from "../NightConditionsForm";
import ShipCard from "../ShipCard";
import SupSelect from "../SupSelect";

import SimulatorResultTable from "./SimulatorResultTable";
import WarfareDetails from "./WarfareDetails";

const GridContainer = styled("div")`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

type StepDetailsProps = {
  plan: PlanEntity;
  step: StepEntity;
};

const StepDetails: React.FCX<StepDetailsProps> = ({
  className,
  style,
  plan,
  step,
}) => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  const { org: playerOrg } = useOrg(plan.org);
  const { org: enemyOrg } = useOrg(step.org);

  const [playerShipId, setPlayerShipId] = useState<string | undefined>(
    playerOrg?.get_ship_entity_id("Main", "s1")
  );
  const [enemyShipId, setEnemyShipId] = useState<string | undefined>(
    enemyOrg?.get_ship_entity_id("Main", "s1")
  );

  if (!playerOrg || !enemyOrg) return null;
  const config = step.config || initialStepConfig;

  const bind =
    <P extends Path<StepConfig>>(path: P) =>
    (value: PathValue<StepConfig, P>) => {
      const next = produce(config, (draft) => {
        set(draft, path, value);
      });

      dispatch(
        stepsSlice.actions.update({
          id: step.id,
          changes: { config: next },
        })
      );
    };

  const playerComp = playerOrg.create_comp();
  const enemyComp = enemyOrg.create_comp();

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
            label={t("Formation.name")}
            combined={playerOrg.is_combined()}
            value={config.player.formation || "LineAhead"}
            onChange={bind("player.formation")}
          />
          <AirStateSelect
            label={t("AirState.name")}
            value={config.air_state}
            onChange={bind("air_state")}
          />
          <EngagementSelect
            label={t("Engagement.name")}
            value={config.engagement}
            onChange={bind("engagement")}
          />
        </Flexbox>
        <FormationSelect
          css={{ width: "fit-content" }}
          label={t("Formation.name")}
          color="secondary"
          combined={enemyOrg.is_combined()}
          value={config.enemy.formation || "LineAhead"}
          onChange={bind("enemy.formation")}
        />
        <NightConditionsForm
          color="primary"
          value={config.player.night_conditions}
          onChange={bind("player.night_conditions")}
        />
        <NightConditionsForm
          color="secondary"
          value={config.enemy.night_conditions}
          onChange={bind("enemy.night_conditions")}
        />
        <Stack gap={1}>
          {playerShip && (
            <>
              <ShipCard ship={playerShip} comp={playerComp} visibleMiscStats />
              <CustomModifiersDialog ship={playerShip} />
            </>
          )}
        </Stack>
        <Stack gap={1}>
          {enemyShip && (
            <>
              <ShipCard ship={enemyShip} comp={enemyComp} visibleMiscStats />
              <CustomModifiersDialog ship={enemyShip} />
            </>
          )}
        </Stack>
      </GridContainer>

      <Tabs
        list={[
          {
            label: t("Details"),
            panel: playerShip && enemyShip && (
              <WarfareDetails
                playerComp={playerComp}
                playerShip={playerShip}
                enemyComp={enemyComp}
                enemyShip={enemyShip}
                config={config}
              />
            ),
          },
          {
            label: "砲撃支援シミュレータ",
            panel: (
              <div>
                <SupSelect
                  label={t("FleetType.RouteSup")}
                  sx={{ mb: 1 }}
                  value={playerOrg.route_sup as FleetKey | undefined}
                  onChange={(route_sup) =>
                    dispatch(
                      orgsSlice.actions.update({
                        id: playerOrg.id,
                        changes: { route_sup },
                      })
                    )
                  }
                />
                <SimulatorResultTable
                  player={playerComp}
                  enemy={enemyComp}
                  config={config}
                  times={10000}
                />
              </div>
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
