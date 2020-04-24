import MasterShip from "./MasterShip"
import { ShipData } from "@fleethub/data"

const defaultData: ShipData = {
  id: 0,
  name: "",
  ruby: "",
  shipClass: 0,
  shipType: 0,
  maxHp: 0,
  firepower: 0,
  armor: 0,
  torpedo: 0,
  evasion: 0,
  antiAir: 0,
  asw: 0,
  speed: 0,
  los: 0,
  range: 0,
  luck: 0,
  fuel: 0,
  ammo: 0,
  slots: [],
  gears: [],
}

const getShipData = (def: Partial<ShipData>): ShipData => {
  return { ...defaultData, ...def }
}

describe("MasterShip", () => {
  it("constructor", () => {
    expect(new MasterShip(defaultData)).toMatchObject<Partial<MasterShip>>({
      id: 0,
      name: "",
      ruby: "",
      shipClass: 0,
      shipType: 0,
      maxHp: [0, 0],
      firepower: [0, 0],
      armor: [0, 0],
      torpedo: [0, 0],
      evasion: [0, 0],
      antiAir: [0, 0],
      asw: [0, 0],
      los: [0, 0],
      luck: [0, 0],
      speed: 0,
      range: 0,
      fuel: 0,
      ammo: 0,
      slots: [],
      gears: [],
    })

    expect(new MasterShip({ maxHp: 5 })).toMatchObject<Partial<MasterShip>>({ maxHp: [5, 5] })
    expect(new MasterShip({ maxHp: [10, 15] })).toMatchObject<Partial<MasterShip>>({ maxHp: [10, 15] })

    expect(new MasterShip({ gears: [1, 2, { gearId: 3, stars: 4 }] })).toMatchObject<Partial<MasterShip>>({
      gears: [{ gearId: 1 }, { gearId: 2 }, { gearId: 3, stars: 4 }],
    })
  })

  it("rankはsortIdの下一桁", () => {
    expect(new MasterShip({ sortId: 51 }).rank).toBe(1)
    expect(new MasterShip({ sortId: 162 }).rank).toBe(2)
  })
})
