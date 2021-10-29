/** @jsxImportSource @emotion/react */
import { MapEnemyFleet, MapNode, MapNodeType } from "@fh/utils";
import { Formation, OrgState } from "fleethub-core";
import React from "react";
import { useAsync } from "react-async-hook";

import { fetchMap } from "../../../firebase";
import { useFhCore } from "../../../hooks";
import { MapSelectState } from "../../../store";
import { Flexbox } from "../../atoms";
import { NauticalChart } from "../../organisms";
import AreaSelect from "./AreaSelect";
import DifficultySelect from "./DifficultySelect";
import EnemyCompList from "./EnemyCompList";
import { createOrg } from "./createOrg";

export type MapEnemySelectEvent = {
  name: string;
  point: string;
  d: MapNode["d"];
  type: MapNode["type"];
  org: OrgState;
  formation: Formation;
};

type MapMenuProps = {
  state: MapSelectState;
  update: (changes: Partial<MapSelectState>) => void;
  onEnemySelect: (event: MapEnemySelectEvent) => void;
};

const MapMenu: React.FCX<MapMenuProps> = ({ state, update, onEnemySelect }) => {
  const { mapId, point, diff } = state;

  const { masterData } = useFhCore();

  const asyncMap = useAsync(fetchMap, [mapId]);
  const map = asyncMap.result;

  const node = map?.nodes.find((node) => {
    if (point) {
      return node.point === point;
    } else {
      return node.type === MapNodeType.Boss;
    }
  });

  const handleAreaChange = (value: number) => {
    update({ mapId: value });
  };

  const handleDiffChange = (value: number) => {
    update({ diff: value });
  };

  const handleNodeClick = (node: MapNode) => {
    update({ point: node.point });
  };

  const handleEnemySelect = (enemy: MapEnemyFleet, formation: Formation) => {
    if (!node) return;
    const { point, type, d } = node;

    const mapKey = `${Math.floor(mapId / 10)}-${mapId % 10}`;
    const name = `${mapKey} ${point}`;

    const org = createOrg(masterData, enemy);

    onEnemySelect({
      point,
      name,
      d,
      type,
      formation,
      org,
    });
  };

  return (
    <div>
      <Flexbox>
        <AreaSelect value={mapId} onChange={handleAreaChange} />
        <DifficultySelect value={diff} onChange={handleDiffChange} />
      </Flexbox>

      <div css={{ width: 640 }}>
        {map && <NauticalChart map={map} onClick={handleNodeClick} />}
        {node && (
          <EnemyCompList
            node={node}
            difficulty={diff}
            onSelect={handleEnemySelect}
          />
        )}
      </div>
    </div>
  );
};

export default MapMenu;
