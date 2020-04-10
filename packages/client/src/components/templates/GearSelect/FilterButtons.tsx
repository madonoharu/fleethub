import React from "react"
import styled from "styled-components"
import { GearBase } from "@fleethub/core"

import { SelectButtons } from "../../../components"
import FilterIcon from "./FilterIcon"

export type GearFilterFn = (gear: GearBase) => boolean

export type GearFilter = { icon: string; fn: GearFilterFn }

const basicFilters: GearFilter[] = [
  {
    icon: "fighter",
    fn: (gear) => gear.categoryIn("CarrierBasedFighterAircraft", "JetPoweredFighter"),
  },
  {
    icon: "bomber",
    fn: (gear) =>
      gear.categoryIn(
        "CarrierBasedDiveBomber",
        "CarrierBasedTorpedoBomber",
        "JetPoweredFighterBomber",
        "JetPoweredTorpedoBomber"
      ),
  },
  {
    icon: "reconnaissance",
    fn: (gear) =>
      gear.is("ReconnaissanceAircraft") ||
      gear.is("Seaplane") ||
      gear.categoryIn("Autogyro", "AntiSubmarinePatrolAircraft"),
  },
  { icon: "mainGun", fn: (gear) => gear.is("MainGun") },
  { icon: "secondary", fn: (gear) => gear.categoryIn("SecondaryGun", "AntiAircraftGun") },
  { icon: "torpedo", fn: (gear) => gear.categoryIn("Torpedo", "SubmarineTorpedo", "MidgetSubmarine") },
  { icon: "antiSubmarine", fn: (gear) => gear.categoryIn("Sonar", "LargeSonar", "DepthCharge") },
  { icon: "radar", fn: (gear) => gear.is("Radar") },
  {
    icon: "landing",
    fn: (gear) => gear.categoryIn("LandingCraft", "SpecialAmphibiousTank", "SupplyTransportContainer"),
  },
  { icon: "ration", fn: (gear) => gear.categoryIn("CombatRation", "Supplies") },
  { icon: "landBased", fn: (gear) => gear.is("LandBasedAircraft") },
]

export const filters: GearFilter[] = [
  { icon: "all", fn: () => true },
  ...basicFilters,
  { icon: "other", fn: (gear) => !basicFilters.some(({ fn }) => fn(gear)) },
]

export const filterNameToFn = (name?: string) => {
  const found = filters.find((filter) => filter.icon === name)
  if (found) return found.fn

  return filters[0].fn
}

export const getOptionLabel = (filterName: string) => <FilterIcon icon={filterName} />

type Props = {
  value: string
  onChange: (value: string) => void
  equippableGears: GearBase[]
}

const GearFilterButtons: React.FCX<Props> = ({ className, value, onChange, equippableGears }) => {
  const options = filters.filter((gearFilter) => equippableGears.some(gearFilter.fn)).map(({ icon }) => icon)
  return (
    <SelectButtons
      className={className}
      options={options}
      value={value}
      onChange={onChange}
      getOptionLabel={getOptionLabel}
    />
  )
}

export default styled(GearFilterButtons)`
  button {
    padding: 4px 0;
  }
`
