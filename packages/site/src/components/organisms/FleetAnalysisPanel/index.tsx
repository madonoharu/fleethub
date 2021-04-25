import styled from "@emotion/styled";
import { Fleet } from "@fleethub/core";
import { Paper } from "@material-ui/core";
import React from "react";

type Props = {
  fleet: Fleet;
};

const FleetAnalysisPanel: React.FC<Props> = ({ fleet }) => {
  const {
    fleetLosModifier,
    aviationDetectionScore,
    transportPoint,
    expeditionBonus,
  } = fleet;
  return (
    <Paper>
      <p>艦隊索敵補正: {fleetLosModifier}</p>
      <p>航空偵察スコア: {aviationDetectionScore}</p>
      <p>TP(S勝利): {transportPoint}</p>
      <p>TP(A勝利): {Math.floor(transportPoint * 0.7)}</p>
      <p>遠征補正: {expeditionBonus}</p>
    </Paper>
  );
};

export default FleetAnalysisPanel;
