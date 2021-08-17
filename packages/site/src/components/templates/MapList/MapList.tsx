import styled from "@emotion/styled";
import { FhMap, MapEnemyFleet, MapNode, MapNodeType } from "@fleethub/utils";
import { Button } from "@material-ui/core";
import React from "react";
import { useAsync } from "react-async-hook";
import { useDispatch, useSelector } from "react-redux";

import { useModal } from "../../../hooks";
import {
  appSlice,
  mapListSlice,
  MapListState,
  selectMapListState,
} from "../../../store";
import { Select } from "../../molecules";
import { NauticalChart } from "../../organisms";
import MapNodeContent from "./MapNodeContent";
import MapSelect from "./MapSelect";

const fetchStorage = <T extends unknown = unknown>(path: string) =>
  fetch(`https://storage.googleapis.com/kcfleethub.appspot.com/${path}`).then(
    (res) => res.json()
  ) as Promise<T>;

const fetchMap = (id: number) => fetchStorage<FhMap>(`maps/${id}.json`);

const StyledMapSelect = styled(MapSelect)`
  margin: 8px;
`;

const useMapListState = () => {
  const { mapId, point, diff } = useSelector(selectMapListState);
  const dispatch = useDispatch();

  const asyncMap = useAsync((id: number) => fetchMap(id), [mapId]);
  const map = asyncMap.result;

  const update = (changes: Partial<MapListState>) =>
    dispatch(mapListSlice.actions.update(changes));

  const node = map?.nodes.find((node) => {
    if (point) {
      return node.point === point;
    } else {
      return node.type === MapNodeType.Boss;
    }
  });

  const setNode = ({ point }: MapNode) => update({ point });

  const setMapId = (next: number) => {
    if (mapId === next) return;

    update({ mapId: next, point: "" });
  };

  const setDiff = (diff: number) => update({ diff });

  return {
    mapId,
    map,
    setMapId,
    node,
    setNode,
    diff,
    setDiff,
  };
};

type MapListProps = {
  onSelectEnemy?: (value: { node: MapNode; enemy: MapEnemyFleet }) => void;
};

const MapList: React.FCX<MapListProps> = ({ onSelectEnemy }) => {
  const Modal = useModal();
  const { mapId, map, setMapId, node, setNode, diff, setDiff } =
    useMapListState();

  const handleMapSelect = (id: number) => {
    setMapId(id);
    Modal.hide();
  };

  const handleEnemySelect = (enemy: MapEnemyFleet) => {
    if (!onSelectEnemy || !node) return;

    onSelectEnemy({ node, enemy });
  };

  const handleNodeClick = (node: MapNode) => {
    if (!node.enemies) return;
    setNode(node);
  };

  return (
    <div>
      <Modal>
        <StyledMapSelect onSelect={handleMapSelect} />
      </Modal>

      <Button onClick={Modal.show} variant="outlined">
        海域 {mapId}
      </Button>
      <Select
        options={[4, 3, 2, 1]}
        value={diff}
        onChange={setDiff}
        getOptionLabel={(diff) => ["丁", "丙", "乙", "甲"][diff - 1]}
      />

      {map && <NauticalChart map={map} onClick={handleNodeClick} />}

      {node && (
        <MapNodeContent
          node={node}
          difficulty={diff}
          onEnemySelect={handleEnemySelect}
        />
      )}
    </div>
  );
};

export default MapList;
