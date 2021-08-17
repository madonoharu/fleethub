import { Ship } from "@fleethub/core";
import { nanoid } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ShipEntity, ShipPosition, shipsSelectors, shipsSlice } from "../store";
import { selectShipState, useFhCore } from "./useFhCore";

export const useShipActions = (id: string) => {
  const dispatch = useDispatch();

  return useMemo(() => {
    const add = (position: ShipPosition, ship: Ship) => {
      dispatch(
        shipsSlice.actions.add(
          { id: nanoid(), ship_id: ship.ship_id },
          position
        )
      );
    };

    const update = (changes: Partial<ShipEntity>) => {
      id && dispatch(shipsSlice.actions.update({ id, changes }));
    };

    const reselect = (ship: Ship) => {
      if (id) {
        dispatch(shipsSlice.actions.reselect({ id, ship_id: ship.ship_id }));
      }
    };

    const remove = () => {
      id && dispatch(shipsSlice.actions.remove(id));
    };

    return { add, update, reselect, remove };
  }, [dispatch, id]);
};

export const useShip = (id: string) => {
  const { core } = useFhCore();
  const actions = useShipActions(id);
  const entity = useSelector((root) => shipsSelectors.selectById(root, id));
  const state = useSelector((root) => selectShipState(root, id));

  const ship = useMemo(() => state && core.create_ship(state), [core, state]);

  return {
    ship,
    entity,
    actions,
  };
};
