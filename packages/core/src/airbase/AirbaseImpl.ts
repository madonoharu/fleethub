import { Airbase } from "./types"
import { Equipment } from "../equipment"

export class AirbaseImpl implements Airbase {
  constructor(public equipment: Equipment) {}
}
