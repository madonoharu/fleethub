import { nonNullable } from "@fh/utils";
import { Stack, Tabs, Tab, Button, Alert } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";
import { shallowEqual } from "react-redux";

import { useAppDispatch, useRootSelector } from "../../../hooks";
import {
  filesSlice,
  mapSelectSlice,
  PlanEntity,
  StepEntity,
  stepsSelectors,
  stepsSlice,
} from "../../../store";
import { ClearButton } from "../../molecules";

interface NodeStepProps {
  step: StepEntity;
}

const NodeStep: React.FC<NodeStepProps> = ({ step }) => {
  const dispatch = useAppDispatch();

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    dispatch(stepsSlice.actions.remove(step.id));
  };

  return (
    <Stack className="flex-row items-center">
      <span>{step.name}</span>
      <ClearButton className="ml-2" size="tiny" onClick={handleRemove} />
    </Stack>
  );
};

interface Props {
  file: PlanEntity;
  activeStep: StepEntity | undefined;
}

const NodeList: React.FC<Props> = ({ file, activeStep }) => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  const steps = useRootSelector(
    (root) => file.steps.map((id) => stepsSelectors.selectById(root, id)).filter(nonNullable),
    shallowEqual,
  );

  const handleTabChange = (event: unknown, id: unknown) => {
    if (typeof id === "string") {
      dispatch(
        filesSlice.actions.update({
          id: file.id,
          changes: { activeStep: id },
        }),
      );
    }
  };

  const showMapMenu = () => {
    dispatch(
      mapSelectSlice.actions.show({
        createStep: true,
        position: file.id,
        multiple: false,
      }),
    );
  };

  const showMapMenuWithMultiple = () => {
    dispatch(
      mapSelectSlice.actions.show({
        createStep: true,
        position: file.id,
        multiple: true,
      }),
    );
  };

  return (
    <Stack className="flex-row gap-2">
      {!activeStep && (
        <Alert className="p-[1px_16px]" severity="info">
          {t("PleaseSelectTheEnemyComp")}
        </Alert>
      )}
      <Tabs
        className="h-8 min-h-0"
        value={activeStep?.id}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {steps.map((step) => (
          <Tab
            className="h-8 min-h-0 pl-0 pr-0"

            disableRipple
            key={step.id}
            value={step.id}
            label={<NodeStep step={step} />}
            component="div"
          />
        ))}
      </Tabs>
      <Button
        className="shrink-0"

        variant="contained"
        color="primary"
        onClick={showMapMenu}
      >
        {t("InputFromMap")}
      </Button>
      <Button
        className="shrink-0"

        variant="contained"
        color="primary"
        onClick={showMapMenuWithMultiple}
      >
        {t("BatchInput")}
      </Button>
    </Stack>
  );
};

export default NodeList;
