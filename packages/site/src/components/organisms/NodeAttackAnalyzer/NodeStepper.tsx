import { nonNullable } from "@fh/utils";
import { Stack, Tabs, Tab, Button } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

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
    <Stack flexDirection="row" alignItems="center">
      <span>{step.name}</span>
      <ClearButton sx={{ ml: 1 }} size="tiny" onClick={handleRemove} />
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

  const steps = useRootSelector((root) => {
    return file.steps
      .map((id) => stepsSelectors.selectById(root, id))
      .filter(nonNullable);
  });

  const handleTabChange = (event: unknown, id: unknown) => {
    if (typeof id === "string") {
      dispatch(
        filesSlice.actions.update({
          id: file.id,
          changes: { activeStep: id },
        })
      );
    }
  };

  const showMapMenu = () => {
    dispatch(
      mapSelectSlice.actions.show({
        createStep: true,
        position: file.id,
        multiple: false,
      })
    );
  };

  const showMapMenuWithMultiple = () => {
    dispatch(
      mapSelectSlice.actions.show({
        createStep: true,
        position: file.id,
        multiple: true,
      })
    );
  };

  return (
    <Stack flexDirection="row" gap={1}>
      <Tabs
        value={activeStep?.id}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {steps.map((step) => (
          <Tab
            sx={{ pl: 0, pr: 0 }}
            disableRipple
            key={step.id}
            value={step.id}
            label={<NodeStep step={step} />}
            component="div"
          />
        ))}
      </Tabs>
      <Button
        css={{ flexShrink: 0 }}
        variant="contained"
        color="primary"
        onClick={showMapMenu}
      >
        {t("InputFromMap")}
      </Button>
      <Button
        css={{ flexShrink: 0 }}
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
