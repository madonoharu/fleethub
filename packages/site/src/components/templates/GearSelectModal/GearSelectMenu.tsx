import ListIcon from "@mui/icons-material/List";
import SearchIcon from "@mui/icons-material/Search";
import { nanoid } from "@reduxjs/toolkit";
import { Gear } from "fleethub-core";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { useFhCore, useShip } from "../../../hooks";
import { entitiesSlice } from "../../../store";
import { makeGetNextEbonuses } from "../../../utils";
import { Tabs, TabsProps } from "../../molecules";
import GearList from "../GearList";

import GearSearchMenu from "./GearSearchMenu";

type Props = {
  gears: Gear[];
};

const GearSelectMenu: React.FCX<Props> = ({ className, gears }) => {
  const { module } = useFhCore();

  const dispatch = useDispatch();
  const create = useSelector((root) => root.present.gearSelect.create);
  const position = useSelector((root) => root.present.gearSelect.position);

  const ship = useShip(position?.id);
  const key = position?.key;

  let canEquip: ((gear: Gear) => boolean) | undefined;

  if (position?.tag === "airSquadrons") {
    canEquip = module.air_squadron_can_equip;
  } else if (ship) {
    canEquip = (gear) => ship.can_equip(gear, position?.key || "g1");
  }
  const getNextEbonuses = ship && key && makeGetNextEbonuses(ship, key);

  const handleSelect = (gear: Gear) => {
    if (!create || !position) return;

    const input = {
      gear_id: gear.gear_id,
      id: nanoid(),
    };

    dispatch(
      entitiesSlice.actions.createGear({
        input,
        position,
      })
    );
  };

  const list: TabsProps["list"] = [
    {
      icon: <ListIcon />,
      iconPosition: "start" as const,
      label: "List",
      panel: (
        <GearList
          gears={gears}
          canEquip={canEquip}
          getNextEbonuses={getNextEbonuses}
          onSelect={handleSelect}
        />
      ),
    },
    {
      icon: <SearchIcon />,
      iconPosition: "start" as const,
      label: "検索",
      panel: <GearSearchMenu gears={gears} />,
    },
  ];

  return <Tabs className={className} size="small" list={list} />;
};

export default GearSelectMenu;
