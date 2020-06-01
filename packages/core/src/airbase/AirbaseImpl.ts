import { Airbase } from "./types"
import { Equipment } from "../equipment"

const canEquip: Airbase["canEquip"] = (gear) => {
  return gear.in("CbAircraft", "Seaplane", "JetAircraft", "LbAircraft")
}

export class AirbaseImpl implements Airbase {
  constructor(public equipment: Equipment) {}

  public canEquip = canEquip
}
