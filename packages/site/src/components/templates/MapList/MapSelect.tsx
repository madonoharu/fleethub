import { Button } from "@material-ui/core";
import React from "react";

import { Divider } from "../../atoms";

const worlds = [
  { id: 1, name: "鎮守府海域" },
  { id: 2, name: "南西諸島海域" },
  { id: 3, name: "北方海域" },
  { id: 7, name: "南西海域" },
  { id: 4, name: "西方海域" },
  { id: 5, name: "南方海域" },
  { id: 6, name: "中部海域" },
  { id: 45, name: "欧州方面反撃作戦 発動！「シングル作戦」" },
  { id: 46, name: "進撃！第二次作戦「南方作戦」" },
  { id: 47, name: "桃の節句！沖に立つ波" },
];

const idToKey = (id: number) => `${Math.floor(id / 10)}-${id % 10}`;

type Props = {
  mapIds: number[];
  onSelect?: (mapId: number) => void;
};

const MapSelect: React.FCX<Props> = ({ className, mapIds, onSelect }) => {
  return (
    <div className={className}>
      {worlds.map((world) => (
        <div key={world.id}>
          <Divider label={world.name} />
          {mapIds
            .filter((mapId) => Math.floor(mapId / 10) === world.id)
            .map((mapId) => (
              <Button key={mapId} onClick={() => onSelect?.(mapId)}>
                {idToKey(mapId)}
              </Button>
            ))}
        </div>
      ))}
    </div>
  );
};

export default MapSelect;
