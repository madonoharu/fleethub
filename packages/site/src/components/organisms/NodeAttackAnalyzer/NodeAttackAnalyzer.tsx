import { FLEET_KEYS, uppercase } from "@fh/utils";
import { Paper, Stack } from "@mui/material";
import type { NodeAttackAnalyzerConfig, NodeState, Org } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React, { useMemo } from "react";

import { useShip, useAppDispatch, useRootSelector, useOrg } from "../../../hooks";
import { useCompShipSelection } from "../../../hooks/useCompShipSelection";
import { OrgEntity, orgsSlice, PlanEntity, selectActiveStep, stepsSlice } from "../../../store";
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

  const activeStep = useRootSelector((root) => selectActiveStep(root, file));

  const stepMap = activeStep?.map || 0;
  const stepNode = activeStep?.node || "";
  const base = activeStep?.config;

  // config と comp は下流の analyze_node_attack の memo キーになるので、
  // 毎レンダー作り直さない。
  const config = useMemo<NodeAttackAnalyzerConfig>(() => {
    const node_state: NodeState = {
      map: stepMap,
      node: stepNode,
      debuff: false,
      phase: 0,
    };

    return { node_state, ...base };
  }, [stepMap, stepNode, base]);

  const disableConfig = !activeStep;

  const leftComp = useMemo(() => leftOrg.create_comp(), [leftOrg]);
  const [leftShipId, setLeftShipId] = useCompShipSelection(leftComp);
  const leftShip = useShip(leftShipId);

  const { org: rightOrg } = useOrg(activeStep?.org || "");
  const rightComp = useMemo(() => rightOrg?.create_comp(), [rightOrg]);
  const [rightShipId, setRightShipId] = useCompShipSelection(rightComp);
  const rightShip = useShip(rightShipId);

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
      }),
    );
  };

  const updateLeftOrg = (changes: Partial<OrgEntity>) => {
    dispatch(orgsSlice.actions.update({ id: leftOrg.id, changes }));
  };

  return (
    <Stack className="gap-2 pt-4">
      <NodeStepper file={file} activeStep={activeStep} />

      <Paper className="p-2">
        <Stack className="gap-2" direction="row">
          <Select
            className="w-20"

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

      <Stack className="gap-2 flex-wrap" direction="row">
        {leftShip && (
          <Stack className="gap-2 [flex-basis:1px] grow min-w-0">
            <ShipCard ship={leftShip} comp={leftComp} visibleMiscStats />
            <CustomModifiersDialog ship={leftShip} />
          </Stack>
        )}
        {rightShip && (
          <Stack className="gap-2 [flex-basis:1px] grow min-w-0">
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

      <SimulateButton leftComp={leftComp} rightComp={rightComp} config={config} times={10000} />
    </Stack>
  );
};

export default React.memo(NodeAttackAnalyzer);
