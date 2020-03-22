import fs from "fs"
import signale from "signale"

import { MstShip, Start2, isPlayerShip } from "./start2"
import { ships, ShipData } from "../src"
import { abyssalNameToClass, createAbyssalShipClassJpMap } from "./types"

const getSlots = (mstShip: MstShip, shipData?: ShipData) => {
  const { api_slot_num } = mstShip
  if ("api_maxeq" in mstShip) {
    const { api_maxeq } = mstShip
    return Array.from({ length: api_slot_num }, (_, i) => api_maxeq[i])
  }
  if (!shipData) {
    return new Array(api_slot_num).fill(-1)
  }
  return shipData.slots
}

class ShipUpdater {
  constructor(private start2: Start2) {}

  private createShipData = (mstShip: MstShip): ShipData => {
    if (isPlayerShip(mstShip)) {
      const { api_aftershipid, api_afterlv } = mstShip
      const nextId = Number(api_aftershipid)
      return {
        id: mstShip.api_id,
        sortNo: mstShip.api_sortno,
        sortId: mstShip.api_sort_id,
        name: mstShip.api_name,
        ruby: mstShip.api_yomi,
        shipType: mstShip.api_stype,
        shipClass: mstShip.api_ctype,
        hp: mstShip.api_taik,
        firepower: mstShip.api_houg,
        armor: mstShip.api_souk,
        torpedo: mstShip.api_raig,
        evasion: -1,
        asw: -1,
        los: -1,
        antiAir: mstShip.api_tyku,
        speed: mstShip.api_soku,
        range: mstShip.api_leng,
        luck: mstShip.api_luck,
        fuel: mstShip.api_fuel_max,
        ammo: mstShip.api_bull_max,
        slots: getSlots(mstShip),
        gears: [],
        nextId: nextId || undefined,
        nextLevel: api_afterlv || undefined
      }
    }

    const shipClass = mstShip.api_ctype === 1 ? 0 : mstShip.api_ctype
    return {
      id: mstShip.api_id,
      name: mstShip.api_name,
      ruby: mstShip.api_yomi,
      shipType: mstShip.api_stype,
      shipClass,
      hp: -2,
      firepower: -2,
      armor: -2,
      torpedo: -2,
      evasion: -1,
      asw: -1,
      los: -1,
      antiAir: -2,
      speed: mstShip.api_soku,
      range: -2,
      luck: -2,
      fuel: 0,
      ammo: 0,
      slots: getSlots(mstShip),
      gears: []
    }
  }

  private mergeAbyssalShipClass = (ships: ShipData[]) => {
    const classMap = createAbyssalShipClassJpMap(this.start2)
    return ships.map(ship => {
      if (ship.id < 1500) {
        return ship
      }

      const next = { ...ship }

      const classId = classMap.find(([className]) => className === abyssalNameToClass(ship.name))?.[1]
      next.shipClass = classId ?? -1

      return next
    })
  }

  public merge = (ships: ShipData[]) => {
    const merged = this.start2.api_mst_ship.map(mstShip => {
      const shipData = ships.find(({ id }) => id === mstShip.api_id)

      if (!shipData) {
        signale.info(`create ${mstShip.api_name}`)
        return this.createShipData(mstShip)
      }

      if (isPlayerShip(mstShip)) {
        const nextShipData = this.createShipData(mstShip)
        nextShipData.evasion = shipData.evasion
        nextShipData.asw = shipData.asw
        nextShipData.los = shipData.los
        nextShipData.slots = shipData.slots
        nextShipData.gears = shipData.gears

        return nextShipData
      }

      return shipData
    })

    return this.mergeAbyssalShipClass(merged)
  }
}

export const writeShips = async (start2: Start2) => {
  const updater = new ShipUpdater(start2)
  const next = updater.merge(ships)

  await fs.promises.writeFile("json/ships.json", JSON.stringify(next))
  signale.complete()
}
