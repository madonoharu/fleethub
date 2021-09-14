import { Ship } from "@fh/core";
import { nonNullable } from "@fh/utils";
import { TFunction, useTranslation } from "next-i18next";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useImmer } from "use-immer";

import { useFhCore } from "../../../hooks";

type FilterFn = (ship: Ship) => boolean;

export type ShipFilterState = {
  abyssal: boolean;
  all: boolean;
  group: string;
};

const createFilterFn = (state: ShipFilterState): FilterFn => {
  const fns: FilterFn[] = [];

  if (state.abyssal) {
    fns.push((ship) => ship.is_abyssal());
  } else {
    fns.push((ship) => !ship.is_abyssal());
    if (!state.all) {
      fns.push((ship) => !ship.next_id || ship.useful);
    }
  }

  fns.push((ship) => ship.filter_group() === state.group);

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

export const useShipListState = () => {
  const { masterData, core } = useFhCore();

  const { t } = useTranslation("ships");

  const abyssal = useSelector((root) => root.present.shipSelect.abyssal);

  const [state, update] = useImmer<ShipFilterState>({
    abyssal: abyssal || false,
    all: false,
    group: "Battleship",
  });

  const [searchValue, setSearchValue] = useState("");

  const masterShips = React.useMemo(() => {
    return masterData.ships
      .map((ship) => core.create_ship_by_id(ship.ship_id))
      .filter(nonNullable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterData]);

  const visibleShips = React.useMemo(() => {
    if (searchValue) {
      return searchShip(t, masterShips, searchValue);
    }

    const filterFn = createFilterFn(state);
    return masterShips.filter(filterFn).sort(sortIdComparer);
  }, [searchValue, t, state, masterShips]);

  return {
    state,
    update,
    masterShips,
    visibleShips,
    searchValue,
    setSearchValue,
  };
};
