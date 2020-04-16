import { createShipAttrs, ShipAttribute } from "./ShipAttribute"
import { ShipClass } from "@fleethub/data"
import { ShipDef, defToData } from "../utils/testUtils"

type ExpectedLine = [ShipDef, ShipAttribute] | [ShipDef, "not", ShipAttribute]

type ExpectedTable = ExpectedLine[]

describe("ShipAttribute", () => {
  it("createShipAttrs", () => {
    const table: ExpectedTable = [
      [{ shipClass: ShipClass.QueenElizabethClass }, "RoyalNavy"],
      [{ shipClass: ShipClass.NelsonClass }, "RoyalNavy"],
      [{ shipClass: ShipClass.ArkRoyalClass }, "RoyalNavy"],
      [{ shipClass: ShipClass.JClass }, "RoyalNavy"],

      [{ shipClass: ShipClass.JohnCButlerClass }, "UsNavy"],
      [{ shipClass: ShipClass.FletcherClass }, "UsNavy"],
      [{ shipClass: ShipClass.IowaClass }, "UsNavy"],
      [{ shipClass: ShipClass.LexingtonClass }, "UsNavy"],
      [{ shipClass: ShipClass.EssexClass }, "UsNavy"],
      [{ shipClass: ShipClass.CasablancaClass }, "UsNavy"],
      [{ shipClass: ShipClass.ColoradoClass }, "UsNavy"],
      [{ shipClass: ShipClass.NorthamptonClass }, "UsNavy"],
      [{ shipClass: ShipClass.AtlantaClass }, "UsNavy"],

      [{ shipClass: ShipClass.TashkentClass }, "SovietNavy"],
      [{ shipClass: ShipClass.GangutClass }, "SovietNavy"],
      ["Верный", "SovietNavy"],

      [{ speed: 0 }, "Installation"],
      [{ speed: 1 }, "not", "Installation"],

      [{ shipClass: ShipClass.AirfieldPrincess }, "SoftSkinned"],
      [{ shipClass: ShipClass.NorthernPrincess }, "SoftSkinned"],
      [{ shipClass: ShipClass.HarbourPrincess }, "SoftSkinned"],
      [{ shipClass: ShipClass.SupplyDepotPrincess }, "SoftSkinned"],
      [{ shipClass: ShipClass.SupplyDepotSummerPrincess }, "SoftSkinned"],

      [{ shipClass: ShipClass.ArtilleryImp }, "Pillbox"],

      [{ shipClass: ShipClass.IsolatedIslandDemon }, "IsolatedIsland"],
      [{ shipClass: ShipClass.IsolatedIslandPrincess }, "IsolatedIsland"],

      [{ shipClass: ShipClass.SupplyDepotPrincess }, "SupplyDepot"],
      [{ shipClass: ShipClass.SupplyDepotSummerPrincess }, "SupplyDepot"],

      [{ sortId: 11 }, "Unremodeled"],
      [{ sortId: 12 }, "not", "Unremodeled"],

      [{ sortId: 215 }, "not", "Kai2"],
      [{ sortId: 216 }, "Kai2"],
      [{ sortId: 218 }, "Kai2"],
      [{ sortId: 219 }, "not", "Kai2"],
    ]

    table.forEach((line) => {
      const base = defToData(line[0])
      if (line[1] === "not") {
        expect(createShipAttrs(base)).not.toContain<ShipAttribute>(line[2])
      } else {
        expect(createShipAttrs(base)).toContain<ShipAttribute>(line[1])
      }
    })
  })
})
