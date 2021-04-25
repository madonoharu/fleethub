import { Container } from "@material-ui/core";
import { EntityId } from "@reduxjs/toolkit";
import React from "react";

import PlanTabs from "./PlanTabs";

type PlanScreenProps = {
  id: EntityId;
};

const PlanScreen: React.FCX<PlanScreenProps> = ({ id }) => {
  return (
    <Container>
      <PlanTabs id={id} />
    </Container>
  );
};

export default PlanScreen;
