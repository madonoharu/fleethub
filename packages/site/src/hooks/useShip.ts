import { Ship } from "@fh/core";
import { useMemo } from "react";
import { DefaultRootState, useDispatch, useSelector } from "react-redux";
import { createStructuredSelector } from "reselect";

import {
  createShip,
  denormalizeShip,
  gearsSelectors,
  NormalizedDictionaries,
  NormalizedEntities,
  ShipEntity,
  ShipPosition,
  shipSelectSlice,
  shipsSelectors,
  shipsSlice,
} from "../store";
import { useFhCore } from "./useFhCore";

export const useShipActions = (id?: string) => {
  const dispatch = useDispatch();

  return useMemo(() => {
    const add = (ship: Ship, position?: ShipPosition) => {
      dispatch(createShip({ ship, position }));
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

    return { add, update, reselect, remove };
  }, [dispatch, id]);
};

const selectShipAllEntities = createStructuredSelector<
  DefaultRootState,
  Required<Pick<NormalizedDictionaries, "ships" | "gears">>
>({
  ships: shipsSelectors.selectEntities,
  gears: gearsSelectors.selectEntities,
});

export const useShip = (id?: string) => {
  const { core } = useFhCore();

  const ship = useSelector(
    (root) => {
      if (!id) return;

      const entities = selectShipAllEntities(root);
      const state = denormalizeShip(entities as NormalizedEntities, id);

      return state && core.create_ship(state);
    },
    (a, b) => a?.xxh3 === b?.xxh3
  );

  return ship;
};
