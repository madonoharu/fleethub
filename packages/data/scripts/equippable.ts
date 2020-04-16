import fs from "fs"
import signale from "signale"

import { Start2 } from "./start2"
import { EquippableData } from "../src"

class EquippableUpdater {
  constructor(private start2: Start2) {}

  private getShipTypeEquippableData = () => {
    return this.start2.api_mst_stype.map(({ api_id, api_equip_type }) => {
      const categories = Object.entries(api_equip_type)
        .filter(([category, equippable]) => equippable === 1)
        .map(([category, equippable]) => Number(category))

      return { id: api_id, categories }
    })
  }

  private getShipEquippableData = () => {
    const { api_mst_ship } = this.start2
    return api_mst_ship
      .map(({ api_id: id }) => {
        const { api_mst_equip_ship, api_mst_equip_exslot_ship } = this.start2

        const categories = api_mst_equip_ship.find(({ api_ship_id }) => api_ship_id === id)?.api_equip_type

        const exslot = api_mst_equip_exslot_ship
          .filter(({ api_ship_ids }) => api_ship_ids.includes(id))
          .map(({ api_slotitem_id }) => api_slotitem_id)

        if (!categories && exslot.length === 0) {
          return undefined
        }

        return {
          id,
          categories,
          exslot: exslot.length > 0 ? exslot : undefined,
        }
      })
      .filter((eq): eq is NonNullable<typeof eq> => Boolean(eq))
  }

  public getEquippable = (): EquippableData => ({
    shipType: this.getShipTypeEquippableData(),
    ship: this.getShipEquippableData(),
    exslotCategories: this.start2.api_mst_equip_exslot,
  })
}

export const writeEquippable = (start2: Start2) => {
  const equippable = new EquippableUpdater(start2).getEquippable()

  fs.writeFileSync("json/equippable.json", JSON.stringify(equippable))
  signale.complete()
}
