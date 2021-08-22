import styled from "@emotion/styled";
import { Formation } from "@fleethub/core";
import { MapEnemyFleet, MapNode } from "@fleethub/utils";
import React from "react";

import { NodeLable } from "../../organisms/NauticalChart";
import MapEnemyFleetCard from "./MapEnemyFleetCard";

const StyledMapEnemyFleetCard = styled(MapEnemyFleetCard)`
  margin: 8px;
`;

type Props = {
  mapId: number;
  node: MapNode;
  difficulty?: number;
  onEnemySelect?: (enemy: MapEnemyFleet, formation: Formation) => void;
};

const MapNodeContent: React.FCX<Props> = ({
  className,
  node,
  difficulty,
  onEnemySelect,
}) => {
  return (
    <div className={className}>
      <NodeLable node={node} />
      {node.enemies
        ?.filter(
          (enemy) => !difficulty || !enemy.diff || enemy.diff === difficulty
        )
        .map((enemy, index) => (
          <StyledMapEnemyFleetCard
            key={index}
            enemy={enemy}
            lbas={node.d !== undefined}
            onSelect={onEnemySelect}
          />
        ))}
    </div>
  );
};

export default MapNodeContent;
