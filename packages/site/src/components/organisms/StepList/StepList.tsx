import { FleetKey, FLEET_KEYS, nonNullable, uppercase } from "@fh/utils";
import { Button } from "@mui/material";
import { styled } from "@mui/system";
import { useTranslation } from "next-i18next";
import React from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { useOrg } from "../../../hooks";
import {
  filesSlice,
  mapSelectSlice,
  stepsSelectors,
  PlanEntity,
} from "../../../store";
import { Flexbox } from "../../atoms";
import { DeleteButton, Select } from "../../molecules";

import StepListItem from "./StepListItem";

const SUP_OPTIONS = [undefined, ...FLEET_KEYS];

type StepListProps = {
  file: PlanEntity;
};

const StepList: React.FCX<StepListProps> = ({ className, file }) => {
  const { t } = useTranslation("common");
  const dispatch = useDispatch();

  const { org, actions } = useOrg(file.org);

  const update = (changes: Partial<PlanEntity>) => {
    dispatch(filesSlice.actions.update({ id: file.id, changes }));
  };

  const removeSteps = () => {
    dispatch(filesSlice.actions.removeSteps(file.id));
  };

  const steps = useSelector((root) => {
    if (!file.steps) {
      return [];
    }

    return file.steps
      .map((id) => stepsSelectors.selectById(root, id))
      .filter(nonNullable);
  }, shallowEqual);

  const handleSwap = (i1: number, i2: number) => {
    const steps = file.steps?.concat() || [];
    const step1 = steps[i1];
    const step2 = steps[i2];
    steps[i1] = step2;
    steps[i2] = step1;
    update({ steps });
  };

  if (!org) {
    return null;
  }

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
    <div className={className}>
      <Flexbox gap={1}>
        <Button variant="contained" color="primary" onClick={showMapMenu}>
          敵編成を追加
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={showMapMenuWithMultiple}
        >
          敵編成を一括入力
        </Button>
        <Select
          css={{ width: 80 }}
          label={t("Sortie")}
          options={FLEET_KEYS}
          value={org.sortie}
          onChange={(sortie) => actions.update({ sortie })}
          getOptionLabel={uppercase}
        />
        <Select
          css={{ width: 96 }}
          label={t("FleetType.RouteSup")}
          options={SUP_OPTIONS}
          value={org.route_sup as FleetKey | undefined}
          getOptionLabel={(key) => (key ? uppercase(key) : t("None"))}
          onChange={(route_sup) => actions.update({ route_sup })}
        />

        <DeleteButton onClick={removeSteps} />
      </Flexbox>

      {steps.map((step, index) => (
        <StepListItem
          key={step.id}
          sx={{ mt: 1 }}
          index={index}
          plan={file}
          step={step}
          onSwap={handleSwap}
        />
      ))}
    </div>
  );
};

export default styled(StepList)`
  min-height: 400px;
  padding: 8px;
`;
