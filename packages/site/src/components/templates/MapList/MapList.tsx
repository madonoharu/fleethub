import styled from "@emotion/styled";
import { Button } from "@material-ui/core";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { useModal } from "../../../hooks";
import {
  appSlice,
  mapListSlice,
  MapListState,
  selectMapListState,
} from "../../../store";
import { Select } from "../../molecules";
import MapSelect from "./MapSelect";

const loader = () =>
  fetch(
    "https://storage.googleapis.com/kcfleethub.appspot.com/maps/all.json"
  ).then((res) => res.json());

const StyledMapSelect = styled(MapSelect)`
  margin: 8px;
`;

const getMapKey = (id: number) => `${Math.floor(id / 10)}-${id % 10}`;

// const useMapListState = () => {
//   const { mapId, point, difficulty } = useSelector(selectMapListState);
//   const dispatch = useDispatch();

//   const update = (changes: Partial<MapListState>) =>
//     dispatch(mapListSlice.actions.update(changes));

//   const map = maps.find((map) => map.id === mapId);
//   const node = map?.nodes.find((node) => node.point === point);

//   const setNode = ({ point }: MapNode) => update({ point });

//   const setMap = (nextMap: MapData) => {
//     if (mapId === nextMap.id) return;

//     const boss = nextMap.nodes.find((node) => node.type === MapNodeType.Boss);
//     if (boss) setNode(boss);

//     update({ mapId: nextMap.id, point: boss?.point });
//   };

//   const setDifficulty = (difficulty: number) => update({ difficulty });

//   return {
//     map,
//     setMap,
//     node,
//     setNode,
//     difficulty,
//     setDifficulty,
//   };
// };

const MapList: React.FCX = () => {
  const Modal = useModal();

  // const mapKey = map ? getMapKey(map.id) : "不明";

  // const handleMapSelect = (nextMap: MapData) => {
  //   setMap(nextMap);
  //   Modal.hide();
  // };

  // const handleEnemySelect = (enemy: EnemyFleetState) => {
  //   if (!node || !onSelectNodePlan) return;
  //   const { type, point, d } = node;
  //   const name = `${mapKey} ${point}`;
  //   onSelectNodePlan({ type, point, d, name, enemy });
  // };

  // const handleNodeClick = (node: MapNode) => {
  //   if (!node.enemies) return;
  //   setNode(node);
  // };

  return (
    <div>
      <Modal>
        <StyledMapSelect mapIds={[11, 12, 13]} />
      </Modal>

      <Button onClick={Modal.show} variant="outlined">
        海域 1-1
      </Button>
      {/* <Select
        options={[4, 3, 2, 1]}
        value={difficulty}
        onChange={setDifficulty}
        getOptionLabel={(diff) => ["丁", "丙", "乙", "甲"][diff - 1]}
      />

      {map && <NauticalChart data={map} onClick={handleNodeClick} />}
      {node && (
        <MapNodeContent
          node={node}
          difficulty={difficulty}
          onEnemySelect={handleEnemySelect}
        />
      )} */}
    </div>
  );
};

export default MapList;
