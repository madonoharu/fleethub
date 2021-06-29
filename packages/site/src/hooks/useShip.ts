import { EntityId } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ShipEntity, shipsSelectors, shipsSlice } from "../store";
import { getEbonuses } from "../utils";
import { selectShipState, useFhCore } from "./useFhCore";

export const useShipActions = (id: EntityId) => {
  const dispatch = useDispatch();

  return useMemo(() => {
    const update = (changes: Partial<ShipEntity>) => {
      id && dispatch(shipsSlice.actions.update({ id, changes }));
    };

    const remove = () => {
      id && dispatch(shipsSlice.actions.remove(id));
    };

    return { update, remove };
  }, [dispatch, id]);
};

export const useShip = (id: EntityId) => {
  const { createShip } = useFhCore();
  const actions = useShipActions(id);
  const entity = useSelector((root) => shipsSelectors.selectById(root, id));
  const state = useSelector((root) => selectShipState(root, id));

  const ship = useMemo(() => {
    const ship = state && createShip(state);
    if (ship) {
      const ebonuses = getEbonuses(ship);
      ship.set_ebonuses({
        ...ebonuses,
        anti_air: ebonuses.antiAir,
        speed: 0,
        effective_los: 0,
      });
    }

    return ship;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return {
    ship,
    entity,
    actions,
  };
};
