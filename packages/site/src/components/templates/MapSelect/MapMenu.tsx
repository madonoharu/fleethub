import { FhMap, MapEnemyComp, MapNode, MapNodeType } from "@fh/utils";
import { Formation, OrgState } from "fleethub-core";
import React from "react";

import { useFhCore, useGcs } from "../../../hooks";
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

  const { data } = useGcs<FhMap>(`data/maps/${mapId}.json`);

  const node = data?.nodes.find((node) => {
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

  const handleEnemySelect = (enemy: MapEnemyComp, formation: Formation) => {
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
        {data && <NauticalChart map={data} onClick={handleNodeClick} />}
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
