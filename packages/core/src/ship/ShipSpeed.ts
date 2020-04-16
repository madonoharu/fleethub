import { ShipBase, SpeedGroup } from "./MasterShip"
import { Equipment } from "../equipment"
import { GearId, ShipId, ShipClass } from "@fleethub/data"

const createSpeedBonus = (
  ship: Pick<ShipBase, "shipId" | "shipClass" | "speedGroup">,
  equipment: { has: (id: GearId) => boolean; count: (id: GearId) => number }
) => {
  if (!equipment.has(GearId["改良型艦本式タービン"])) return 0

  const { shipId, shipClass, speedGroup } = ship
  const enhancedBoilerCount = equipment.count(GearId["強化型艦本式缶"])
  const newModelBoilerCount = equipment.count(GearId["新型高温高圧缶"])
  const totalBoilerCount = enhancedBoilerCount + newModelBoilerCount

  if (speedGroup === SpeedGroup.FastA) {
    if (newModelBoilerCount >= 1 || totalBoilerCount >= 2) return 10
  }

  if (speedGroup === SpeedGroup.FastB1SlowA && newModelBoilerCount >= 1) {
    if (totalBoilerCount >= 3) return 15
    if (totalBoilerCount >= 2) return 10
  }

  if (speedGroup === SpeedGroup.FastB2SlowB) {
    if (newModelBoilerCount >= 2 || totalBoilerCount >= 3) return 10
  }

  if (shipClass === ShipClass.JohnCButlerClass || shipId === ShipId["夕張改二特"]) {
    return 5
  }

  return 0
}

class ShipSpeed {
  constructor(public naked: number, public bonus: number) {}

  public displayed() {
    return this.naked + this.bonus
  }
}
