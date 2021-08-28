import styled from "@emotion/styled";
import {
  FleetParams,
  Formation,
  MasterDataInput,
  OrgParams,
  ShipParams,
} from "@fleethub/core";
import { FhMap, MapEnemyFleet, MapNode, MapNodeType } from "@fleethub/utils";
import { Button } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import React from "react";
import { useAsync } from "react-async-hook";
import { useDispatch, useSelector } from "react-redux";

import { useFhCore, useModal } from "../../../hooks";
import { mapListSlice, MapListState, selectMapListState } from "../../../store";
import { Flexbox } from "../../atoms";
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

const MapSelectButton = styled(Button)`
  height: 40px;
  margin-right: 8px;
  .MuiButton-endIcon {
    font-size: 1.5rem;
  }
`;

const toShipParams = (md: MasterDataInput, ship_id: number): ShipParams => {
  const masterShip = md.ships.find(
    (masterShip) => masterShip.ship_id === ship_id
  );
  const gearEntries = masterShip?.stock.map(
    (g, i) => [`g${i + 1}`, g] as const
  );
  const gears = gearEntries && Object.fromEntries(gearEntries);

  return { ship_id, ...gears };
};

const toFleetParams = (md: MasterDataInput, shipIds: number[]): FleetParams => {
  const entries = shipIds.map(
    (id, i) => [`s${i + 1}`, toShipParams(md, id)] as const
  );

  const fleet: FleetParams = Object.fromEntries(entries);

  fleet.len = shipIds.length;

  return fleet;
};

const createOrgParams = (
  md: MasterDataInput,
  enemy: MapEnemyFleet
): OrgParams => {
  const { main, escort } = enemy;

  return {
    org_type: escort ? "EnemyCombined" : "EnemySingle",
    f1: toFleetParams(md, main),
    f2: escort && toFleetParams(md, escort),
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
  d?: number;
  type: number;
  org: OrgParams;
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

    const org = createOrgParams(masterData, enemy);

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
