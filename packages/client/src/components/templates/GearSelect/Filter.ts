import { GearData, GearCategory, GearCategoryKey } from "@fleethub/data"
import { MasterGear } from "@fleethub/kcsim"

type GearFilter = (gear: MasterGear) => boolean

const filters: Array<{ icon: string; filter: GearFilter }> = [
  {
    icon: "fighter",
    filter: (gear) => gear.categoryIn("CarrierBasedFighterAircraft", "JetPoweredFighter"),
  },
  {
    icon: "bomber",
    filter: (gear) =>
      gear.categoryIn(
        "CarrierBasedDiveBomber",
        "CarrierBasedTorpedoBomber",
        "JetPoweredFighterBomber",
        "JetPoweredTorpedoBomber"
      ),
  },
]
