import { Gear } from "@fleethub/core";
import { isNonNullable } from "@fleethub/utils";
import master_data from "@fleethub/utils/master_data";
import { EquipmentBonuses } from "equipment-bonus";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useFhCore } from "../../../hooks";
import { gearListSlice, selectGearListState } from "../../../store";
import { Flexbox } from "../../atoms";
import { SearchInput } from "../../organisms";
import CategoryContainer from "./CategoryContainer";
import { idComparer } from "./comparers";
import FilterBar from "./FilterBar";
import { getFilter, getVisibleGroups } from "./filters";
import GearSearchResult from "./GearSearchResult";
import searchGears from "./searchGears";

const createCategoryGearEntries = (gears: Gear[]) => {
  const map = new Map<number, Gear[]>();

  const setGear = (gear: Gear) => {
    const list = map.get(gear.category);
    if (list) {
      list.push(gear);
    } else {
      map.set(gear.category, [gear]);
    }
  };

  gears.forEach(setGear);

  return Array.from(map.entries());
};

const getDefaultFilterKey = (keys: string[]) => {
  const found = ["mainGun", "torpedo", "landBased", "fighter"].find((key) =>
    keys.includes(key)
  );
  return found || keys[0] || "all";
};

type GearListProps = {
  canEquip?: (gear: Gear) => boolean;
  onSelect?: (gear: Gear) => void;
  getNextEbonuses?: (gear: Gear) => EquipmentBonuses;
};

const useGearListState = () => {
  const { createGear } = useFhCore();

  const dispatch = useDispatch();
  const state = useSelector(selectGearListState);

  const gears = useMemo(
    () =>
      master_data.gears
        .map((mg) => createGear({ gear_id: mg.gear_id }))
        .filter(isNonNullable),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const actions = useMemo(() => {
    const update = (...args: Parameters<typeof gearListSlice.actions.update>) =>
      dispatch(gearListSlice.actions.update(...args));

    const setAbyssal = (abyssal: boolean) => update({ abyssal });
    const setGroup = (group: string) => update({ group });

    return { update, setAbyssal, setGroup };
  }, [dispatch]);

  return { gears, ...state, createGear, actions };
};

const GearList: React.FC<GearListProps> = ({
  canEquip,
  onSelect,
  getNextEbonuses,
}) => {
  const { gears, abyssal, group, actions, createGear } = useGearListState();

  const [searchValue, setSearchValue] = useState("");

  const handleSelect = (gear: Gear) => onSelect?.(gear);

  const { equippableGears, visibleGroups } = React.useMemo(() => {
    const equippableGears = gears.filter((gear) => {
      if (abyssal !== gear.gear_id >= 500) return false;
      return !canEquip || canEquip(gear);
    });

    const visibleGroups = getVisibleGroups(equippableGears);

    return { equippableGears, visibleGroups };
  }, [gears, abyssal, canEquip]);

  const currentGroup = visibleGroups.includes(group)
    ? group
    : getDefaultFilterKey(visibleGroups);
  const groupFilter = getFilter(currentGroup);

  const visibleGears = equippableGears.filter(groupFilter).sort(idComparer);

  const entries = createCategoryGearEntries(visibleGears);

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
        visibleGroups={visibleGroups}
        abyssal={abyssal}
        group={currentGroup}
        onAbyssalChange={actions.setAbyssal}
        onGroupChange={actions.setGroup}
      />
      {searchResult ? (
        <GearSearchResult
          searchValue={searchValue}
          gears={searchResult}
          onSelect={handleSelect}
        />
      ) : (
        <CategoryContainer
          entries={entries}
          onSelect={handleSelect}
          getNextEbonuses={getNextEbonuses}
        />
      )}
    </div>
  );
};

export default GearList;
