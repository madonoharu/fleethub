import { ShipFilterGroup } from "@fh/core";
import React from "react";
import { Updater } from "use-immer";

import { Checkbox, Flexbox } from "../../atoms";
import { SelectButtons } from "../../molecules";
import { ShipFilterState } from "./useShipListState";

const shipFilterGroupMap: Record<ShipFilterGroup, string> = {
  Battleship: "戦艦級",
  AircraftCarrier: "航空母艦",
  HeavyCruiser: "重巡級",
  LightCruiser: "軽巡級",
  Destroyer: "駆逐艦",
  CoastalDefenseShip: "海防艦",
  Submarine: "潜水艦",
  AuxiliaryShip: "補助艦艇",
};

const SHIP_FILTER_GROUP_OPTIONS = Object.keys(
  shipFilterGroupMap
) as ShipFilterGroup[];

type Props = {
  state: ShipFilterState;
  update: Updater<ShipFilterState>;
};

const FilterBar: React.FCX<Props> = ({ className, state, update }) => {
  const toggleAbyssal = () =>
    update((s) => {
      s.abyssal = !s.abyssal;
    });

  const toggleAll = () =>
    update((s) => {
      s.all = !s.all;
    });

  const handleGroupChange = (group: string) => {
    update((s) => {
      s.group = group;
    });
  };

  return (
    <Flexbox className={className}>
      <SelectButtons
        css={{ marginRight: "auto" }}
        options={SHIP_FILTER_GROUP_OPTIONS}
        value={state.group as ShipFilterGroup}
        onChange={handleGroupChange}
        getOptionLabel={(key) => shipFilterGroupMap[key]}
      />
      <Checkbox
        label="全表示"
        size="small"
        checked={state.all}
        onChange={toggleAll}
      />
      <Checkbox
        label="深海"
        size="small"
        checked={state.abyssal}
        onChange={toggleAbyssal}
      />
    </Flexbox>
  );
};

export default FilterBar;
