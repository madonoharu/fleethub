import { Container } from "@material-ui/core";
import { EntityId } from "@reduxjs/toolkit";
import React from "react";

import { useFile, usePlan } from "../../../hooks";
import PlanScreenHeader from "./PlanScreenHeader";
import PlanTabs from "./PlanTabs";

type PlanScreenProps = {
  id: EntityId;
};

const PlanScreen: React.FCX<PlanScreenProps> = ({ id }) => {
  const { plan, actions: planActions } = usePlan(id);
  const { file, actions: fileActions } = useFile(id as string);

  if (!plan || file?.type !== "plan") return null;

  return (
    <Container>
      <PlanScreenHeader
        plan={plan}
        file={file}
        onNameChange={fileActions.setName}
        onHqLevelChange={planActions.setHqLevel}
      />
      <PlanTabs plan={plan} />
    </Container>
  );
};

export default PlanScreen;
