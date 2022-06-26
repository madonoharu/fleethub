import { ShipCategory } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

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

interface Props {
  filterState: ShipFilterState;
  updateFilterState: (changes: Partial<ShipFilterState>) => void;
}

const FilterBar: React.FCX<Props> = (props) => {
  const { t } = useTranslation("common");

  const { className, filterState, updateFilterState } = props;

  const handleCategoryChange = (category: ShipCategory) => {
    updateFilterState({ category });
  };

  const handleVisibleAllFormsChange = (visibleAllForms: boolean) => {
    updateFilterState({ visibleAllForms });
  };

  const handleAbyssalChange = (abyssal: boolean) => {
    updateFilterState({ abyssal });
  };

  return (
    <Flexbox className={className}>
      <SelectButtons
        css={{ marginRight: "auto" }}
        options={SHIP_CATEGORY_OPTIONS}
        value={filterState.category}
        onChange={handleCategoryChange}
        getOptionLabel={(key) => t(`ShipCategory.${key}`)}
      />
      <Checkbox
        label={t("ShowAllForms")}
        size="small"
        checked={filterState.visibleAllForms}
        onChange={handleVisibleAllFormsChange}
      />
      <Checkbox
        label={t("Abyssal")}
        size="small"
        checked={filterState.abyssal}
        onChange={handleAbyssalChange}
      />
    </Flexbox>
  );
};

export default FilterBar;
