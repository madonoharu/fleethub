import { GearState } from "@fleethub/utils";
import { EntityId } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { GearPosition, gearsSlice, shipsSelectors, shipsSlice } from "../store";
import { getEbonuses } from "../utils";
import { selectShipState, useFhCore } from "./useFhCore";

export const useShip = (id: EntityId) => {
  const { createShip } = useFhCore();
  const dispatch = useDispatch();
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

  const actions = useMemo(() => {
    const remove = () => {
      id && dispatch(shipsSlice.actions.remove(id));
    };

    const setGear = (to: GearPosition, state: GearState) => {
      dispatch(gearsSlice.actions.add(state, { ship: to }));
    };

    return { remove, setGear };
  }, [dispatch, id]);

  return {
    ship,
    entity,
    actions,
  };
};
