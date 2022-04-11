import { Ship } from "fleethub-core";
import { useMemo } from "react";

import {
  entitiesSlice,
  selectShipState,
  ShipEntity,
  ShipPosition,
  shipSelectSlice,
  shipsSlice,
} from "../store";

import { useAppDispatch, useAppSelector } from "./rtk-hooks";
import { useFhCore } from "./useFhCore";

export const useShipActions = (id?: string) => {
  const dispatch = useAppDispatch();

  return useMemo(() => {
    const add = (ship: Ship, position?: ShipPosition) => {
      dispatch(
        entitiesSlice.actions.createShip({
          input: ship.state(),
          position,
        })
      );
    };

    const update = (changes: Partial<ShipEntity>) => {
      id && dispatch(shipsSlice.actions.update({ id, changes }));
    };

    const reselect = () => {
      if (id) {
        dispatch(shipSelectSlice.actions.create({ id, reselect: true }));
      }
    };

    const remove = () => {
      id && dispatch(shipsSlice.actions.remove(id));
    };

    return {
      add,
      update,
      reselect,
      remove,
    };
  }, [dispatch, id]);
};

export const useShip = (id?: string) => {
  const { core } = useFhCore();

  const ship = useAppSelector(
    (root) => {
      if (!id) return;
      const state = selectShipState(root, id);
      return state && core.create_ship(state);
    },
    (a, b) => a?.xxh3 === b?.xxh3
  );

  return ship;
};
