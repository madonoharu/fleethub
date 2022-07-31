import type { Comp, Ship, NodeAttackAnalyzerConfig } from "fleethub-core";
import React from "react";

import { useFhCore } from "../../../hooks";
import { Flexbox } from "../../atoms";
import AttackAnalysisCard from "../AttackAnalysisCard";

interface Props {
  config: NodeAttackAnalyzerConfig;
  leftComp: Comp;
  leftShip: Ship;
  rightComp: Comp;
  rightShip: Ship;
}

const NodeAttackDetails: React.FC<Props> = ({
  config,
  leftComp,
  leftShip,
  rightComp,
  rightShip,
}) => {
  const { analyzer } = useFhCore();
  const result = analyzer.analyze_node_attack(
    config,
    leftComp,
    leftShip,
    rightComp,
    rightShip
  );

  return (
    <Flexbox
      gap={1}
      css={{
        "> *": {
          width: "50%",
        },
      }}
    >
      <AttackAnalysisCard analysis={result.left} />
      <AttackAnalysisCard analysis={result.right} />
    </Flexbox>
  );
};

export default NodeAttackDetails;
