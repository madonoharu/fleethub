import { nonNullable } from "@fh/utils";
import { Button, Stack } from "@mui/material";
import type { Org } from "fleethub-core";
import React, { useState } from "react";

import {
  useShip,
  useAppDispatch,
  useRootSelector,
  useOrg,
} from "../../../hooks";
import {
  filesSlice,
  mapSelectSlice,
  PlanEntity,
  StepEntity,
  stepsSelectors,
} from "../../../store";
import { Select } from "../../molecules";
import { OrgShipList, ShipCard } from "../../organisms";
import NodeAttackAnalyzer from "../../organisms/NodeAttackAnalyzer";

interface Props {
  org: Org;
  file: PlanEntity;
}

const PlanIndexScreen: React.FC<Props> = ({ org, file }) => {
  const dispatch = useAppDispatch();
  const steps = useRootSelector((root) => {
    return file.steps
      .map((id) => stepsSelectors.selectById(root, id))
      .filter(nonNullable);
  });

  const activeStep = useRootSelector((root) => {
    return (
      stepsSelectors.selectById(root, file.activeStep || "") ||
      stepsSelectors.selectById(root, file.steps[0] || "")
    );
  });

  const { org: enemyOrg } = useOrg(activeStep?.org || "");

  const [activeShipId, setActiveShipId] = useState(org.first_ship_id() || "");

  const activeShip = useShip(activeShipId);

  const showMapMenu = () => {
    dispatch(
      mapSelectSlice.actions.show({
        createStep: true,
        position: file.id,
        multiple: false,
      })
    );
  };

  const handleActiveStepChange = (step: StepEntity) => {
    dispatch(
      filesSlice.actions.update({
        id: file.id,
        changes: { activeStep: step?.id },
      })
    );
  };

  return (
    <Stack gap={1}>
      <Stack direction="row" gap={1} ml="auto">
        {activeStep && (
          <Select
            css={{ width: 120 }}
            options={steps}
            value={activeStep}
            onChange={handleActiveStepChange}
            getOptionLabel={(step) => step?.name || "?"}
          />
        )}
        <Button color="primary" variant="contained" onClick={showMapMenu}>
          海域
        </Button>
      </Stack>

      <Stack direction="row" alignItems="flex-start">
        <OrgShipList
          org={org}
          selectedShip={activeShipId}
          onShipClick={setActiveShipId}
        />
        {enemyOrg && (
          <OrgShipList
            org={enemyOrg}
            selectedShip={activeShipId}
            onShipClick={setActiveShipId}
          />
        )}
      </Stack>
      {activeShip && <ShipCard ship={activeShip} />}

      {enemyOrg && (
        <NodeAttackAnalyzer
          config={activeStep?.config || {}}
          leftComp={org.create_comp()}
          rightComp={enemyOrg?.create_comp()}
          attackerId={activeShipId}
        />
      )}
    </Stack>
  );
};

export default PlanIndexScreen;
