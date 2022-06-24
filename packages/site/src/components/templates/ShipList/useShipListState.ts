import { Ship, ShipCategory } from "fleethub-core";
import { TFunction, useTranslation } from "next-i18next";
import React, { useState } from "react";
import { useImmer } from "use-immer";

import { useRootSelector } from "../../../hooks";

type FilterFn = (ship: Ship) => boolean;

export type ShipFilterState = {
  abyssal: boolean;
  visiblePrevForm: boolean;
  category: ShipCategory;
};

const createFilterFn = (state: ShipFilterState): FilterFn => {
  const fns: FilterFn[] = [];

  if (state.abyssal) {
    fns.push((ship) => ship.is_abyssal());
  } else {
    fns.push((ship) => !ship.is_abyssal());
    if (!state.visiblePrevForm) {
      fns.push((ship) => !ship.next_id || ship.useful);
    }
  }

  fns.push((ship) => ship.category() === state.category);

  return (ship) => fns.every((fn) => fn(ship));
};

const sortIdComparer = (a: Ship, b: Ship) => a.sort_id - b.sort_id;

const searchById = (ships: Ship[], searchValue: string) => {
  const str = /^id(\d+)/.exec(searchValue)?.[1];
  if (!str) return;

  const id = Number(str);
  return ships.find((ship) => ship.ship_id === id);
};

const searchShip = (t: TFunction, ships: Ship[], searchValue: string) => {
  const idFound = searchById(ships, searchValue);

  if (idFound) {
    return [idFound];
  }

  return ships.filter((ship) => {
    const name = t(`${ship.ship_id}`, ship.name);

    return (
      name.toUpperCase().includes(searchValue.toUpperCase()) ||
      ship.yomi.includes(searchValue)
    );
  });
};

export const useShipListState = (ships: Ship[]) => {
  const { t } = useTranslation("ships");

  const abyssal = useRootSelector((root) => root.shipSelect.abyssal);

  const [state, update] = useImmer<ShipFilterState>({
    abyssal: abyssal || false,
    visiblePrevForm: false,
    category: "Battleship",
  });

  const [searchValue, setSearchValue] = useState("");

  const visibleShips = React.useMemo(() => {
    if (searchValue) {
      return searchShip(t, ships, searchValue);
    }

    const filterFn = createFilterFn(state);
    return ships.filter(filterFn).sort(sortIdComparer);
  }, [searchValue, t, state, ships]);

  return {
    state,
    update,
    visibleShips,
    searchValue,
    setSearchValue,
  };
};
