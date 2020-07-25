import React, { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { GearState, GearBase, EquipmentBonuses, Gear } from "@fleethub/core"

import { useFhSystem } from "../../../hooks"
import { gearListSlice, selectGearListState } from "../../../store"

import { SearchInput } from "../../organisms"

import { getFilter, getVisibleGroups } from "./filters"
import { idComparer } from "./comparers"
import FilterBar from "./FilterBar"
import CategoryContainer from "./CategoryContainer"
import GearSearchResult from "./GearSearchResult"
import searchGears from "./searchGears"
import { Flexbox } from "../../atoms"

const createCategoryGearEntries = (gears: GearBase[]) => {
  const map = new Map<number, GearBase[]>()

  const setGear = (gear: GearBase) => {
    const list = map.get(gear.category)
    if (list) {
      list.push(gear)
    } else {
      map.set(gear.category, [gear])
    }
  }

  gears.forEach(setGear)

  return Array.from(map.entries())
}

const getDefaultFilterKey = (keys: string[]) => {
  const found = ["mainGun", "torpedo", "landBased", "fighter"].find((key) => keys.includes(key))
  return found || keys[0] || "all"
}

type GearListProps = {
  canEquip?: (gear: GearBase) => boolean
  getBonuses?: (gear: GearBase) => EquipmentBonuses
  onSelect?: (gear: Gear) => void
}

const useGearListState = () => {
  const { masterGears, createGear } = useFhSystem()

  const dispatch = useDispatch()
  const state = useSelector(selectGearListState)

  const actions = useMemo(() => {
    const update = (...args: Parameters<typeof gearListSlice.actions.update>) =>
      dispatch(gearListSlice.actions.update(...args))

    const setAbyssal = (abyssal: boolean) => update({ abyssal })
    const setGroup = (group: string) => update({ group })

    return { update, setAbyssal, setGroup }
  }, [dispatch])

  return { masterGears, ...state, createGear, actions }
}

const GearList: React.FC<GearListProps> = ({ canEquip, getBonuses, onSelect }) => {
  const { masterGears, abyssal, group, actions, createGear } = useGearListState()

  const [searchValue, setSearchValue] = useState("")

  const handleSelect = (base: GearBase) => {
    if (!onSelect) return
    const state: GearState = { gearId: base.gearId }
    if (base.hasProficiency && !base.categoryIn("LbRecon")) {
      state.exp = 100
    }

    const gear = createGear(state)
    gear && onSelect(gear)
  }

  const { equippableGears, visibleGroups } = React.useMemo(() => {
    const equippableGears = masterGears.filter((gear) => {
      if (abyssal !== gear.is("Abyssal")) return false
      return !canEquip || canEquip(gear)
    })

    const visibleGroups = getVisibleGroups(equippableGears)

    return { equippableGears, visibleGroups }
  }, [masterGears, abyssal, canEquip])

  const currentGroup = visibleGroups.includes(group) ? group : getDefaultFilterKey(visibleGroups)
  const groupFilter = getFilter(currentGroup)

  const visibleGears = equippableGears.filter(groupFilter).sort(idComparer)

  const entries = createCategoryGearEntries(visibleGears)

  const searchResult = searchValue && searchGears(equippableGears, searchValue)

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
          getBonuses={getBonuses}
        />
      ) : (
        <CategoryContainer entries={entries} onSelect={handleSelect} getBonuses={getBonuses} />
      )}
    </div>
  )
}

export default GearList
