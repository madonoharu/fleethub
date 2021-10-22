import { EquipmentBonuses } from "equipment-bonus";
import { Gear, GearCategory } from "fleethub-core";
import React, { useState } from "react";

import { Flexbox } from "../../atoms";
import { SearchInput } from "../../organisms";
import FilterBar from "./FilterBar";
import GearSearchResult from "./GearSearchResult";
import GearTypeContainer from "./GearTypeContainer";
import { idComparer } from "./comparers";
import { getFilter, getVisibleCategories } from "./filters";
import searchGears from "./searchGears";
import { useGearListState } from "./useGearListState";

const createTypeGearEntries = (gears: Gear[]) => {
  const map = new Map<number, Gear[]>();

  const setGear = (gear: Gear) => {
    const list = map.get(gear.gear_type_id);
    if (list) {
      list.push(gear);
    } else {
      map.set(gear.gear_type_id, [gear]);
    }
  };

  gears.forEach(setGear);

  return Array.from(map.entries());
};

const getDefaultFilterKey = (keys: (GearCategory | "All")[]) => {
  const list: GearCategory[] = ["MainGun", "Torpedo", "LandBased", "Fighter"];
  const found = list.find((key) => keys.includes(key));

  return found || keys.at(0) || "All";
};

type GearListProps = {
  canEquip?: (gear: Gear) => boolean;
  onSelect?: (gear: Gear) => void;
  getNextEbonuses?: (gear: Gear) => EquipmentBonuses;
};

const GearList: React.FC<GearListProps> = ({
  canEquip,
  onSelect,
  getNextEbonuses,
}) => {
  const { gears, abyssal, category, setAbyssal, setCategory } =
    useGearListState();

  const [searchValue, setSearchValue] = useState("");

  const handleSelect = (gear: Gear) => onSelect?.(gear);

  const { equippableGears, visibleCategories } = React.useMemo(() => {
    const equippableGears = gears.filter((gear) => {
      if (Boolean(abyssal) !== gear.has_attr("Abyssal")) return false;
      return !canEquip || canEquip(gear);
    });

    const visibleCategories = getVisibleCategories(equippableGears);

    return { equippableGears, visibleCategories };
  }, [gears, abyssal, canEquip]);

  const currentCategory =
    category && visibleCategories.includes(category)
      ? category
      : getDefaultFilterKey(visibleCategories);
  const categoryFilter = getFilter(currentCategory);

  const visibleGears = equippableGears.filter(categoryFilter).sort(idComparer);

  const entries = createTypeGearEntries(visibleGears);

  const searchResult = searchValue && searchGears(equippableGears, searchValue);

  return (
    <div>
      <Flexbox>
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          hint={
            <>
              <p>id検索もできます</p>
              <p>&quot;id308&quot; → 5inch単装砲 Mk.30改+GFCS Mk.37</p>
            </>
          }
        />
      </Flexbox>
      <FilterBar
        visibleCategories={visibleCategories}
        abyssal={abyssal}
        category={currentCategory}
        onAbyssalChange={setAbyssal}
        onCategoryChange={setCategory}
      />
      {searchResult ? (
        <GearSearchResult
          searchValue={searchValue}
          gears={searchResult}
          onSelect={handleSelect}
        />
      ) : (
        <GearTypeContainer
          entries={entries}
          onSelect={handleSelect}
          getNextEbonuses={getNextEbonuses}
        />
      )}
    </div>
  );
};

export default GearList;
