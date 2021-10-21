import styled from "@emotion/styled";
import {
  FleetState,
  Formation,
  MasterData,
  OrgState,
  ShipState,
} from "@fh/core";
import { MapEnemyFleet, MapNode, MapNodeType } from "@fh/utils";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Button } from "@mui/material";
import React from "react";
import { useAsync } from "react-async-hook";
import { useDispatch, useSelector } from "react-redux";

import { fetchMap } from "../../../firebase";
import { useFhCore, useModal } from "../../../hooks";
import { mapListSlice, MapListState, selectMapListState } from "../../../store";
import { Flexbox } from "../../atoms";
import { Select } from "../../molecules";
import { NauticalChart } from "../../organisms";
import MapNodeContent from "./MapNodeContent";
import MapSelect from "./MapSelect";

const StyledMapSelect = styled(MapSelect)`
  margin: 8px;
`;

const MapSelectButton = styled(Button)`
  height: 40px;
  margin-right: 8px;
  .MuiButton-endIcon {
    font-size: 1.5rem;
  }
`;

const toShipState = (md: MasterData, ship_id: number): ShipState => {
  const masterShip = md.ships.find(
    (masterShip) => masterShip.ship_id === ship_id
  );
  const gearEntries = masterShip?.stock.map(
    (g, i) => [`g${i + 1}`, g] as const
  );
  const gears = gearEntries && Object.fromEntries(gearEntries);

  return { ship_id, ...gears };
};

const toFleetState = (md: MasterData, shipIds: number[]): FleetState => {
  const entries = shipIds.map(
    (id, i) => [`s${i + 1}`, toShipState(md, id)] as const
  );

  const fleet: FleetState = Object.fromEntries(entries);

  fleet.len = shipIds.length;

  return fleet;
};

const createOrgState = (md: MasterData, enemy: MapEnemyFleet): OrgState => {
  const { main, escort } = enemy;

  return {
    org_type: escort ? "EnemyCombined" : "EnemySingle",
    f1: toFleetState(md, main),
    f2: escort && toFleetState(md, escort),
  };
};

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

export type MapEnemySelectEvent = {
  name: string;
  point: string;
  d: MapNode["d"];
  type: MapNode["type"];
  org: OrgState;
  formation: Formation;
};

type MapListProps = {
  onMapEnemySelect?: (event: MapEnemySelectEvent) => void;
};

const MapList: React.FCX<MapListProps> = ({ onMapEnemySelect }) => {
  const Modal = useModal();
  const { mapId, map, setMapId, node, setNode, diff, setDiff } =
    useMapListState();

  const { masterData } = useFhCore();

  const handleMapSelect = (id: number) => {
    setMapId(id);
    Modal.hide();
  };

  const createEnemySelectEvent = (
    enemy: MapEnemyFleet,
    formation: Formation
  ): MapEnemySelectEvent | undefined => {
    if (!node) return;
    const { point, type, d } = node;

    const mapKey = `${Math.floor(mapId / 10)}-${mapId % 10}`;
    const name = `${mapKey} ${point}`;

    const org = createOrgState(masterData, enemy);

    const event = {
      point,
      name,
      d,
      type,
      formation,
      org,
    };

    return event;
  };

  const handleEnemySelect = (enemy: MapEnemyFleet, formation: Formation) => {
    const event = createEnemySelectEvent(enemy, formation);

    if (event && onMapEnemySelect) {
      onMapEnemySelect(event);
    }
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

      <Flexbox>
        <MapSelectButton
          onClick={Modal.show}
          variant="contained"
          color="primary"
          endIcon={<ArrowDropDownIcon />}
        >
          海域 {mapId}
        </MapSelectButton>

        <Select
          options={[4, 3, 2, 1]}
          value={diff}
          onChange={setDiff}
          getOptionLabel={(diff) => ["丁", "丙", "乙", "甲"][diff - 1]}
        />
      </Flexbox>

      <div style={{ width: 640 }}>
        {map && <NauticalChart map={map} onClick={handleNodeClick} />}

        {node && (
          <MapNodeContent
            mapId={mapId}
            node={node}
            difficulty={diff}
            onEnemySelect={handleEnemySelect}
          />
        )}
      </div>
    </div>
  );
};

export default MapList;
