import { FleetKey, Path, PathValue } from "@fh/utils";
import { Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { NodeAttackAnalyzerConfig } from "fleethub-core";
import { produce } from "immer";
import set from "lodash/set";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import { useAppDispatch, useOrg } from "../../../hooks";
import { PlanEntity, StepEntity, stepsSlice, orgsSlice } from "../../../store";
import { Flexbox } from "../../atoms";
import { Tabs } from "../../molecules";
import AirStateSelect from "../AirStateSelect";
import CompShipList from "../CompShipList";
import CustomModifiersDialog from "../CustomModifiersDialog";
import EngagementSelect from "../EngagementSelect";
import FormationSelect from "../FormationSelect";
import NightFleetConditionsForm from "../NightFleetConditionsForm";
import ShipCard from "../ShipCard";
import SupSelect from "../SupSelect";

import NodeAttackDetails from "./NodeAttackDetails";
import SimulatorResultTable from "./SimulatorResultTable";

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

  const { org: leftOrg } = useOrg(plan.org);
  const { org: rightOrg } = useOrg(step.org);

  const [leftShipId, setLeftShipId] = useState<string | undefined>(
    leftOrg?.first_ship_id()
  );
  const [rightShipId, setRightShipId] = useState<string | undefined>(
    rightOrg?.first_ship_id()
  );

  if (!leftOrg || !rightOrg) return null;
  const config: NodeAttackAnalyzerConfig = step.config || {};

  const bind =
    <P extends Path<NodeAttackAnalyzerConfig>>(path: P) =>
    (value: PathValue<NodeAttackAnalyzerConfig, P>) => {
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

  const leftComp = leftOrg.create_comp();
  const rightComp = rightOrg.create_comp();

  const leftShip = leftShipId ? leftOrg.get_ship_by_id(leftShipId) : undefined;
  const rightShip = rightShipId
    ? rightOrg.get_ship_by_id(rightShipId)
    : undefined;

  return (
    <div className={className} style={style}>
      <Typography variant="subtitle1">{step.name}</Typography>
      <GridContainer>
        <CompShipList
          comp={leftComp}
          selectedShip={leftShipId}
          onShipSelect={setLeftShipId}
        />
        <CompShipList
          comp={rightComp}
          selectedShip={rightShipId}
          onShipSelect={setRightShipId}
        />
        <Flexbox gap={1}>
          <FormationSelect
            color="primary"
            label={t("Formation.name")}
            combined={leftOrg.is_combined()}
            value={config.left?.formation || "LineAhead"}
            onChange={bind("left.formation")}
          />
          <AirStateSelect
            label={t("AirState.name")}
            value={config.air_state || "AirSupremacy"}
            onChange={bind("air_state")}
          />
          <EngagementSelect
            label={t("Engagement.name")}
            value={config.engagement || "Parallel"}
            onChange={bind("engagement")}
          />
        </Flexbox>
        <FormationSelect
          css={{ width: "fit-content" }}
          label={t("Formation.name")}
          color="secondary"
          combined={rightOrg.is_combined()}
          value={config.right?.formation || "LineAhead"}
          onChange={bind("right.formation")}
        />
        <NightFleetConditionsForm
          color="primary"
          value={config.left}
          onChange={bind("left")}
        />
        <NightFleetConditionsForm
          color="secondary"
          value={config.right}
          onChange={bind("right")}
        />
        <Stack gap={1}>
          {leftShip && (
            <>
              <ShipCard ship={leftShip} comp={leftComp} visibleMiscStats />
              <CustomModifiersDialog ship={leftShip} />
            </>
          )}
        </Stack>
        <Stack gap={1}>
          {rightShip && (
            <>
              <ShipCard ship={rightShip} comp={rightComp} visibleMiscStats />
              <CustomModifiersDialog ship={rightShip} />
            </>
          )}
        </Stack>
      </GridContainer>

      <Tabs
        list={[
          {
            label: t("Details"),
            panel: leftShip && rightShip && (
              <NodeAttackDetails
                leftComp={leftComp}
                leftShip={leftShip}
                rightComp={rightComp}
                rightShip={rightShip}
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
                  value={leftOrg.route_sup as FleetKey | undefined}
                  onChange={(route_sup) =>
                    dispatch(
                      orgsSlice.actions.update({
                        id: leftOrg.id,
                        changes: { route_sup },
                      })
                    )
                  }
                />
                <SimulatorResultTable
                  player={leftComp}
                  enemy={rightComp}
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
