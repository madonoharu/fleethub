/* eslint-disable @typescript-eslint/no-unused-vars */

import ArrowForward from "@mui/icons-material/ArrowForward";
import { Paper, Stack } from "@mui/material";
import type { Comp, NodeAttackAnalyzerConfig, Ship } from "fleethub-core";
import React from "react";

import { useFhCore } from "../../../hooks";
import AttackTable from "../AttackTable";
import ShipBanner from "../ShipBanner";
import NodeAttackDetails from "../StepDetails/NodeAttackDetails";

interface Props {
  config: NodeAttackAnalyzerConfig;
  leftComp: Comp | undefined;
  leftShip: Ship | undefined;
  rightComp: Comp | undefined;
  rightShip: Ship | undefined;
}

const NodeAttackAnalyzer: React.FC<Props> = ({
  config,
  leftComp,
  leftShip,
  rightComp,
  rightShip,
}) => {
  if (!leftComp || !rightComp || !leftShip || !rightShip) {
    return null;
  }

  return (
    <Stack gap={1}>
      <NodeAttackDetails
        config={config}
        leftComp={leftComp}
        leftShip={leftShip}
        rightComp={rightComp}
        rightShip={rightShip}
      />
    </Stack>
  );
};

export default NodeAttackAnalyzer;
