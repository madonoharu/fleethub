import styled from "@emotion/styled";
import { Plan } from "@fleethub/core";
import React from "react";

import { LabeledValue } from "../../atoms";

type Prosp = {
  plan: Plan;
};

const MiscPanel: React.FC<Prosp> = ({ plan }) => {
  return (
    <div>
      <LabeledValue label="TP" value={plan.main.transportPoint} />
    </div>
  );
};

export default MiscPanel;
