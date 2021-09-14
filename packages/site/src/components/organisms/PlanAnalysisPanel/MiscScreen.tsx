import styled from "@emotion/styled";
import { Org } from "@fh/core";
import React from "react";

import { LabeledValue } from "../../atoms";

type Prosp = {
  org: Org;
};

const MiscScreen: React.FC<Prosp> = ({ org }) => {
  return (
    <div>
      <LabeledValue label="TP" value={org.transport_point()} />
    </div>
  );
};

export default MiscScreen;
