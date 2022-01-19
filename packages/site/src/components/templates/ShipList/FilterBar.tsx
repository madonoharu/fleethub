/** @jsxImportSource @emotion/react */
import { ShipCategory } from "fleethub-core";
import React from "react";
import { Updater } from "use-immer";

import { Checkbox, Flexbox } from "../../atoms";
import { SelectButtons } from "../../molecules";

import { ShipFilterState } from "./useShipListState";

const shipCategoryMap: Record<ShipCategory, string> = {
  Battleship: "戦艦級",
  AircraftCarrier: "航空母艦",
  HeavyCruiser: "重巡級",
  LightCruiser: "軽巡級",
  Destroyer: "駆逐艦",
  CoastalDefenseShip: "海防艦",
  Submarine: "潜水艦",
  AuxiliaryShip: "補助艦艇",
};

const SHIP_CATEGORY_OPTIONS = Object.keys(shipCategoryMap) as ShipCategory[];

type Props = {
  state: ShipFilterState;
  update: Updater<ShipFilterState>;
};

const FilterBar: React.FCX<Props> = ({ className, state, update }) => {
  const handleAbyssalChange = (value: boolean) =>
    update((s) => {
      s.abyssal = value;
    });

  const handleVisiblePrevFormChange = (value: boolean) =>
    update((s) => {
      s.visiblePrevForm = value;
    });

  const handleCategoryChange = (category: ShipCategory) => {
    update((s) => {
      s.category = category;
    });
  };

  return (
    <Flexbox className={className}>
      <SelectButtons
        css={{ marginRight: "auto" }}
        options={SHIP_CATEGORY_OPTIONS}
        value={state.category}
        onChange={handleCategoryChange}
        getOptionLabel={(key) => shipCategoryMap[key]}
      />
      <Checkbox
        label="改造前表示"
        size="small"
        checked={state.visiblePrevForm}
        onChange={handleVisiblePrevFormChange}
      />
      <Checkbox
        label="深海"
        size="small"
        checked={state.abyssal}
        onChange={handleAbyssalChange}
      />
    </Flexbox>
  );
};

export default FilterBar;
