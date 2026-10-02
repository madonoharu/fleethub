import { Ship, ShipState } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import { useMemo } from "react";
import { lruMemoize } from "reselect";

import {
  entitiesSlice,
  selectShipState,
  ShipEntity,
  ShipPosition,
  shipSelectSlice,
  shipsSlice,
} from "../store";

import { useAppDispatch, useRootSelector } from "./rtk-hooks";
import { useFhCore } from "./useFhCore";

export function useShipName(shipId: number, withId = false): string {
  const { t, i18n } = useTranslation("ships");
  const { masterData } = useFhCore();

  const defaultName = masterData.ships.find(
    (ship) => ship.ship_id === shipId,
  )?.name;

  let displayName: string;

  if (i18n.resolvedLanguage === "ja") {
    displayName = defaultName || `${shipId}`;
  } else {
    displayName = t(`${shipId}`, defaultName || `${shipId}`);
  }

  if (withId) {
    displayName = `ID:${shipId} ${displayName}`;
  }

  return displayName;
}

export function useShipActions(id?: string) {
  const dispatch = useAppDispatch();

  return useMemo(() => {
    const add = (ship: Ship, position?: ShipPosition) => {
      dispatch(
        entitiesSlice.actions.createShip({
          input: ship.state(),
          position,
        }),
      );
    };

    const update = (changes: Partial<ShipEntity>) => {
      if (id) {
        dispatch(shipsSlice.actions.update({ id, changes }));
      }
    };

    const reselect = () => {
      if (id) {
        dispatch(shipSelectSlice.actions.create({ id, reselect: true }));
      }
    };

    const remove = () => {
      if (id) {
        dispatch(shipsSlice.actions.remove(id));
      }
    };

    return {
      add,
      update,
      reselect,
      remove,
    };
  }, [dispatch, id]);
}

export function useShip(id?: string): Ship | undefined {
  const { core } = useFhCore();

  const createShip = useMemo(
    () =>
      lruMemoize(
        (state: ShipState | undefined) => state && core.create_ship(state),
        {
          resultEqualityCheck: (
            previous: Ship | undefined,
            next: Ship | undefined,
          ) => previous?.hash === next?.hash,
        },
      ),
    [core],
  );

  return useRootSelector((root) =>
    createShip(id ? selectShipState(root, id) : undefined),
  );
}
