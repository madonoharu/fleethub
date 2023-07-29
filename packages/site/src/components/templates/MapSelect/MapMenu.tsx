import { FhMap, MapEnemyComp, MapNode, MapNodeType } from "@fh/utils";
import { Link, Typography } from "@mui/material";
import { Formation } from "fleethub-core";
import React from "react";

import { useFhCore, useGcs } from "../../../hooks";
import { MapSelectState, AddStepPayload } from "../../../store";
import { Flexbox } from "../../atoms";
import { NauticalChart } from "../../organisms";

import AreaSelect from "./AreaSelect";
import DifficultySelect from "./DifficultySelect";
import EnemyCompList from "./EnemyCompList";
import NodeSelect from "./NodeSelect";
import { createOrg } from "./createOrg";

type MapMenuProps = {
  state: MapSelectState;
  update: (changes: Partial<MapSelectState>) => void;
  onEnemySelect: (payload: Omit<AddStepPayload, "file">) => void;
};

const MapMenu: React.FCX<MapMenuProps> = ({ state, update, onEnemySelect }) => {
  const { mapId, point, diff, createStep } = state;

  const { masterData } = useFhCore();

  const { data } = useGcs<FhMap>(`data/maps/${mapId}.json`);

  const activeNode = data?.nodes.find((node) => {
    if (point) {
      return node.point === point;
    } else {
      return (node.type as MapNodeType) === MapNodeType.Boss;
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
    if (!activeNode) return;
    const { point, type, d } = activeNode;

    const mapKey = `${Math.floor(mapId / 10)}-${mapId % 10}`;
    const name = `${mapKey} ${point}`;

    const org = createOrg(masterData, enemy);

    onEnemySelect({
      map: mapId,
      node: point,
      name,
      d,
      type,
      formation,
      org,
    });
  };

  return (
    <div>
      <Flexbox gap={1}>
        <AreaSelect value={mapId} onChange={handleAreaChange} />
        <DifficultySelect value={diff} onChange={handleDiffChange} />
        <NodeSelect
          options={data?.nodes}
          value={activeNode}
          onChange={handleNodeClick}
        />
        <Typography variant="h6" sx={{ ml: "auto" }}>
          <span>from</span>
          <Link ml={1} variant="inherit" href="https://tsunkit.net/nav">
            KCNav
          </Link>
        </Typography>
      </Flexbox>

      <div css={{ width: 640 }}>
        {data && (
          <NauticalChart
            activeNode={activeNode?.point}
            map={data}
            onClick={handleNodeClick}
          />
        )}
        {activeNode && (
          <EnemyCompList
            node={activeNode}
            difficulty={diff}
            disableFormationClick={!createStep}
            onSelect={handleEnemySelect}
          />
        )}
      </div>
    </div>
  );
};

export default MapMenu;
