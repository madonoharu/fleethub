import { Ship } from "@fleethub/core";
import { isNonNullable, ShipAttr, ShipType } from "@fleethub/utils";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { useFhCore } from "../../../hooks";
import {
  selectShipListState,
  shipListSlice,
  ShipListState,
} from "../../../store";

type FilterFn = (ship: Ship) => boolean;

const getShipGroup = ({ ship_type }: Ship) => {
  if (
    [ShipType.FBB, ShipType.BB, ShipType.BBV, ShipType.XBB].includes(ship_type)
  )
    return "Battleship";
  if ([ShipType.CVL, ShipType.CV, ShipType.CVB].includes(ship_type))
    return "AircraftCarrier";
  if ([ShipType.CA, ShipType.CAV].includes(ship_type)) return "HeavyCruiser";
  if ([ShipType.CL, ShipType.CLT].includes(ship_type)) return "LightCruiser";
  if ([ShipType.DD].includes(ship_type)) return "Destroyer";
  if ([ShipType.DE].includes(ship_type)) return "CoastalDefenseShip";
  if ([ShipType.SS, ShipType.SSV].includes(ship_type)) return "Submarine";
  return "SupportShip";
};

const createFilterFn = (state: ShipListState): FilterFn => {
  const fns: FilterFn[] = [];

  if (state.abyssal) {
    fns.push((ship) => ship.has_attr(ShipAttr.Abyssal));
  } else {
    fns.push((ship) => !ship.has_attr(ShipAttr.Abyssal));
    if (!state.all) {
      fns.push((ship) => !ship.next_id || ship.useful);
    }
  }

  if (state.basicFilter) {
    fns.push((ship) => getShipGroup(ship) === state.basicFilter);
  }

  return (ship) => fns.every((fn) => fn(ship));
};

const sortIdComparer = (a: Ship, b: Ship) => a.sort_id - b.sort_id;

export const useShipListState = () => {
  const { master_data, createShip } = useFhCore();
  const state = useSelector(selectShipListState);
  const dispatch = useDispatch();

  const masterShips = React.useMemo(() => {
    return master_data.ships
      .map((ship) => createShip({ ship_id: ship.ship_id }))
      .filter(isNonNullable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [master_data]);

  const update = (changes: Partial<ShipListState>) =>
    dispatch(shipListSlice.actions.update(changes));

  const visibleShips = React.useMemo(() => {
    const filterFn = createFilterFn(state);
    return masterShips.filter(filterFn).sort(sortIdComparer);
  }, [state, masterShips]);

  return { state, update, masterShips, visibleShips };
};
