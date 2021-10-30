/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { nonNullable } from "@fh/utils";
import { Button } from "@mui/material";
import React from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  filesSlice,
  mapSelectSlice,
  PlanFileEntity,
  stepsSelectors,
} from "../../../store";
import { Flexbox } from "../../atoms";
import { DeleteButton } from "../../molecules";
import StepListItem from "./StepListItem";

type StepListProps = {
  file: PlanFileEntity;
};

const StepList: React.FCX<StepListProps> = ({ className, file }) => {
  const dispatch = useDispatch();

  const update = (changes: Partial<PlanFileEntity>) => {
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

  return (
    <div className={className}>
      <Flexbox gap={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            dispatch(
              mapSelectSlice.actions.show({
                createStep: true,
                position: file.id,
                multiple: false,
              })
            );
          }}
        >
          敵編成を追加
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            dispatch(
              mapSelectSlice.actions.show({
                createStep: true,
                position: file.id,
                multiple: true,
              })
            );
          }}
        >
          敵編成を一括入力
        </Button>

        <DeleteButton onClick={removeSteps} />
      </Flexbox>

      {steps.map((step, index) => (
        <StepListItem
          key={step.id}
          css={{ marginTop: 8 }}
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
