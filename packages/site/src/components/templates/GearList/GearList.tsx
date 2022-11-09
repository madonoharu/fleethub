import type { Gear, GearCategory, EBonuses } from "fleethub-core";
import React from "react";

import FilterBar from "./FilterBar";
import GearTypeContainer from "./GearTypeContainer";
import { idComparer } from "./comparers";
import { getFilter, getVisibleCategories } from "./filters";
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
  gears: Gear[];
  canEquip?: (gear: Gear) => boolean;
  onSelect?: (gear: Gear) => void;
  getNextEbonuses?: (gear: Gear) => EBonuses;
};

const GearList: React.FC<GearListProps> = ({
  gears,
  canEquip,
  onSelect,
  getNextEbonuses,
}) => {
  const { abyssal, category, setAbyssal, setCategory } = useGearListState();

  const handleSelect = (gear: Gear) => onSelect?.(gear);

  const { equippableGears, visibleCategories } = React.useMemo(() => {
    const equippableGears = gears.filter((gear) => {
      if (Boolean(abyssal) !== gear.is_abyssal()) return false;
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

  return (
    <div>
      <FilterBar
        visibleCategories={visibleCategories}
        abyssal={abyssal}
        category={currentCategory}
        onAbyssalChange={setAbyssal}
        onCategoryChange={setCategory}
      />
      <GearTypeContainer
        entries={entries}
        onSelect={handleSelect}
        getNextEbonuses={getNextEbonuses}
      />
    </div>
  );
};

export default GearList;
