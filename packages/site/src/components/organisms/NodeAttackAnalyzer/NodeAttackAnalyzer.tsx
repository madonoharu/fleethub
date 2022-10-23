import { FLEET_KEYS, nonNullable, uppercase } from "@fh/utils";
import { Paper, Stack } from "@mui/material";
import type { NodeAttackAnalyzerConfig, NodeState, Org } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import {
  useShip,
  useAppDispatch,
  useRootSelector,
  useOrg,
} from "../../../hooks";
import {
  OrgEntity,
  orgsSlice,
  PlanEntity,
  stepsSelectors,
  stepsSlice,
} from "../../../store";
import { Select } from "../../molecules";
import AirStateSelect from "../AirStateSelect";
import CustomModifiersDialog from "../CustomModifiersDialog";
import EngagementSelect from "../EngagementSelect";
import ShipCard from "../ShipCard";
import SupSelect from "../SupSelect";

import AnalyzerForm from "./AnalyzerForm";
import NodeAttackDetails from "./NodeAttackDetails";
import NodeStateForm from "./NodeStateForm";
import NodeStepper from "./NodeStepper";
import SimulateButton from "./SimulateButton";

interface Props {
  org: Org;
  file: PlanEntity;
}

const NodeAttackAnalyzer: React.FC<Props> = ({ org: leftOrg, file }) => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  const activeStep = useRootSelector((root) => {
    return (
      stepsSelectors.selectById(root, file.activeStep || "") ||
      file.steps
        .map((id) => stepsSelectors.selectById(root, id))
        .filter(nonNullable)
        .at(0)
    );
  });

  const node_state: NodeState = {
    map: activeStep?.map || 0,
    node: activeStep?.node || "",
    debuff: false,
    phase: 0,
  };

  const base = activeStep?.config || {};
  const config: NodeAttackAnalyzerConfig = { node_state, ...base };
  const disableConfig = !activeStep;

  const leftComp = leftOrg.create_comp();
  const [leftShipId, setLeftShipId] = useState(leftComp.first_ship_id());
  const leftShip = useShip(leftShipId);

  const { org: rightOrg } = useOrg(activeStep?.org || "");
  const rightComp = rightOrg?.create_comp();
  const rightCompFirstShipId = rightComp?.first_ship_id();
  const [rightShipId, setRightShipId] = useState(rightCompFirstShipId);
  const rightShip = useShip(rightShipId);

  if (
    rightComp &&
    rightCompFirstShipId &&
    !rightComp.has_ship_eid(rightShipId || "")
  ) {
    setRightShipId(rightCompFirstShipId);
  }

  const handleConfigChange = (value: Partial<NodeAttackAnalyzerConfig>) => {
    dispatch(
      stepsSlice.actions.update({
        id: activeStep?.id || "",
        changes: {
          config: {
            ...config,
            ...value,
          },
        },
      })
    );
  };

  const updateLeftOrg = (changes: Partial<OrgEntity>) => {
    dispatch(orgsSlice.actions.update({ id: leftOrg.id, changes }));
  };

  return (
    <Stack gap={1} sx={{ pt: 2 }}>
      <NodeStepper file={file} activeStep={activeStep} />

      <Paper sx={{ p: 1 }}>
        <Stack direction="row" gap={1}>
          <Select
            css={{ width: 80 }}
            label={t("Sortie")}
            options={FLEET_KEYS}
            value={leftOrg.sortie}
            onChange={(sortie) => updateLeftOrg({ sortie })}
            getOptionLabel={uppercase}
          />
          <SupSelect
            label={t("FleetType.RouteSup")}
            value={leftOrg.route_sup}
            onChange={(route_sup) => updateLeftOrg({ route_sup })}
          />

          <AirStateSelect
            label={t("AirState.name")}
            value={config.air_state || "AirSupremacy"}
            onChange={(air_state) => handleConfigChange({ air_state })}
            disabled={disableConfig}
          />
          <EngagementSelect
            label={t("Engagement.name")}
            value={config.engagement || "Parallel"}
            onChange={(engagement) => handleConfigChange({ engagement })}
            disabled={disableConfig}
          />
          <NodeStateForm
            value={config.node_state}
            onChange={(node_state) => handleConfigChange({ node_state })}
            disabled={disableConfig}
          />
        </Stack>

        <AnalyzerForm
          config={config}
          leftComp={leftComp}
          rightComp={rightComp}
          leftShipId={leftShipId}
          rightShipId={rightShipId}
          disableConfig={disableConfig}
          onLeftShipChange={setLeftShipId}
          onRightShipChange={setRightShipId}
          onConfigChange={handleConfigChange}
        />
      </Paper>

      <Stack direction="row" gap={1} flexWrap="wrap">
        {leftShip && (
          <Stack gap={1} flexBasis={1} flexGrow={1} minWidth={0}>
            <ShipCard ship={leftShip} comp={leftComp} visibleMiscStats />
            <CustomModifiersDialog ship={leftShip} />
          </Stack>
        )}
        {rightShip && (
          <Stack gap={1} flexBasis={1} flexGrow={1} minWidth={0}>
            <ShipCard ship={rightShip} comp={rightComp} visibleMiscStats />
            <CustomModifiersDialog ship={rightShip} />
          </Stack>
        )}
      </Stack>

      <NodeAttackDetails
        config={config}
        leftComp={leftComp}
        leftShip={leftShip}
        rightComp={rightComp}
        rightShip={rightShip}
      />

      <SimulateButton
        leftComp={leftComp}
        rightComp={rightComp}
        config={config}
        times={10000}
      />
    </Stack>
  );
};

export default React.memo(NodeAttackAnalyzer);
