import { ShipCategory } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";
import { Updater } from "use-immer";

import { Checkbox, Flexbox } from "../../atoms";
import { SelectButtons } from "../../molecules";

import { ShipFilterState } from "./useShipListState";

const SHIP_CATEGORY_OPTIONS: ShipCategory[] = [
  "Battleship",
  "AircraftCarrier",
  "HeavyCruiser",
  "LightCruiser",
  "Destroyer",
  "CoastalDefenseShip",
  "Submarine",
  "AuxiliaryShip",
];

type Props = {
  state: ShipFilterState;
  update: Updater<ShipFilterState>;
};

const FilterBar: React.FCX<Props> = ({ className, state, update }) => {
  const { t } = useTranslation("common");

  const handleAbyssalChange = (value: boolean) => {
    update((s) => {
      s.abyssal = value;
    });
  };

  const handleVisiblePrevFormChange = (value: boolean) => {
    update((s) => {
      s.visiblePrevForm = value;
    });
  };

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
        getOptionLabel={(key) => t(`ShipCategory.${key}`)}
      />
      <Checkbox
        label="改造前表示"
        size="small"
        checked={state.visiblePrevForm}
        onChange={handleVisiblePrevFormChange}
      />
      <Checkbox
        label={t("Abyssal")}
        size="small"
        checked={state.abyssal}
        onChange={handleAbyssalChange}
      />
    </Flexbox>
  );
};

export default FilterBar;
