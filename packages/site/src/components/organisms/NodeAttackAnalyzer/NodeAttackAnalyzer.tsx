/* eslint-disable @typescript-eslint/no-unused-vars */

import ArrowForward from "@mui/icons-material/ArrowForward";
import { Paper, Stack } from "@mui/material";
import type { Comp, NodeAttackAnalyzerConfig } from "fleethub-core";
import React from "react";

import { useFhCore } from "../../../hooks";
import AttackTable from "../AttackTable";
import ShipBanner from "../ShipBanner";

interface Props {
  config: NodeAttackAnalyzerConfig;
  leftComp: Comp;
  rightComp: Comp;
  attackerId: string;
}

const NodeAttackAnalyzer: React.FC<Props> = ({
  config,
  leftComp,
  rightComp,
  attackerId,
}) => {
  const { analyzer } = useFhCore();
  return null;
  // const result = analyzer.analyze_node_attack2(
  //   config,
  //   leftComp,
  //   rightComp,
  //   attackerId
  // );
  // console.log(result);

  // if (!result) {
  //   return null;
  // }

  // return (
  //   <Stack gap={1}>
  //     {result.data.map((attack, index) => {
  //       return (
  //         <Paper key={index} sx={{ p: 1 }}>
  //           <Stack direction="row" gap={1} alignItems="center">
  //             <ShipBanner shipId={attack.attacker_ship_id} />
  //             <ArrowForward />
  //             <ShipBanner shipId={attack.target_ship_id} />
  //             <AttackTable report={attack.night} />
  //           </Stack>
  //         </Paper>
  //       );
  //     })}
  //   </Stack>
  // );
};

export default NodeAttackAnalyzer;
