import {
  getPossibleNightSpecialAttackTypes,
  NightSpecialAttackType,
  NightSpecialAttackTypeParams,
} from "./NightSpecialAttackType"
import { ShipType } from "@fleethub/data"

const defaultParams: NightSpecialAttackTypeParams = {
  shipType: 0,
  lateModelBowTorpedoCount: 0,
  hasSubmarineRadar: false,
  mainGunCount: 0,
  secondaryGunCount: 0,
  torpedoCount: 0,
  hasSurfaceRadar: false,
  hasLookout: false,
  isNightCarrier: false,
  nightFighterCount: 0,
  nightAttackerCount: 0,
  hasFuzeBomber: false,
  semiNightPlaneCount: 0,
}

const getTypes = (partial: Partial<NightSpecialAttackTypeParams>) =>
  getPossibleNightSpecialAttackTypes({ ...defaultParams, ...partial })

describe("getPossibleNightSpecialAttackTypes", () => {
  it("主3 -> MainMainMain", () => {
    expect(getTypes({ mainGunCount: 3 })).toContain<NightSpecialAttackType>("MainMainMain")

    expect(getTypes({ mainGunCount: 2 })).not.toContain<NightSpecialAttackType>("MainMainMain")
  })

  it("主2 & 副1 -> MainMainSecond", () => {
    expect(getTypes({ mainGunCount: 2, secondaryGunCount: 1 })).toContain<NightSpecialAttackType>("MainMainSecond")

    expect(getTypes({ mainGunCount: 1, secondaryGunCount: 1 })).not.toContain<NightSpecialAttackType>("MainMainSecond")
  })

  it("魚2 -> TorpTorp", () => {
    expect(getTypes({ torpedoCount: 2 })).toContain<NightSpecialAttackType>("TorpTorp")

    expect(getTypes({ torpedoCount: 1 })).not.toContain<NightSpecialAttackType>("TorpTorp")
  })

  it("主魚魚 -> TorpTorp", () => {
    expect(getTypes({ mainGunCount: 1, torpedoCount: 2 })).toContain<NightSpecialAttackType>("TorpTorp")
  })
  it("主主魚 -> MainTorp", () => {
    expect(getTypes({ mainGunCount: 2, torpedoCount: 1 })).toContain<NightSpecialAttackType>("MainTorp")
  })

  it("主1 & 魚1 -> MainTorp", () => {
    expect(getTypes({ mainGunCount: 1, torpedoCount: 1 })).toContain<NightSpecialAttackType>("MainTorp")

    expect(getTypes({ mainGunCount: 1 })).not.toContain<NightSpecialAttackType>("MainTorp")
    expect(getTypes({ torpedoCount: 1 })).not.toContain<NightSpecialAttackType>("MainTorp")
  })

  it("(主 + 副) == 2 -> DoubleAttack", () => {
    expect(getTypes({ mainGunCount: 2 })).toContain<NightSpecialAttackType>("DoubleAttack")
    expect(getTypes({ secondaryGunCount: 2 })).toContain<NightSpecialAttackType>("DoubleAttack")
    expect(getTypes({ mainGunCount: 1, secondaryGunCount: 1 })).toContain<NightSpecialAttackType>("DoubleAttack")

    expect(getTypes({ mainGunCount: 1 })).not.toContain<NightSpecialAttackType>("DoubleAttack")
    expect(getTypes({ secondaryGunCount: 1 })).not.toContain<NightSpecialAttackType>("DoubleAttack")
  })

  it("後期艦首 + 潜水電探 -> SubmarineRadarTorp", () => {
    expect(getTypes({ lateModelBowTorpedoCount: 1, hasSubmarineRadar: true })).toContain<NightSpecialAttackType>(
      "SubmarineRadarTorp"
    )

    expect(getTypes({ lateModelBowTorpedoCount: 1 })).not.toContain<NightSpecialAttackType>("SubmarineRadarTorp")
    expect(getTypes({ hasSubmarineRadar: true })).not.toContain<NightSpecialAttackType>("SubmarineRadarTorp")
  })
  it("後期艦首2 -> SubmarineTorpTorp", () => {
    expect(getTypes({ lateModelBowTorpedoCount: 2 })).toContain<NightSpecialAttackType>("SubmarineTorpTorp")

    expect(getTypes({ lateModelBowTorpedoCount: 1 })).not.toContain<NightSpecialAttackType>("SubmarineRadarTorp")
  })

  it("潜水CIと通常CIは重複不可", () => {
    expect(getTypes({ lateModelBowTorpedoCount: 2, torpedoCount: 2 })).not.toContain<NightSpecialAttackType>("TorpTorp")
  })

  it("DD & 主1魚1水上電探 -> MainTorpRadar", () => {
    expect(getTypes({ shipType: ShipType.DD, mainGunCount: 1, torpedoCount: 1, hasSurfaceRadar: true })).toContain<
      NightSpecialAttackType
    >("MainTorpRadar")

    expect(getTypes({ mainGunCount: 1, torpedoCount: 1, hasSurfaceRadar: true })).not.toContain<NightSpecialAttackType>(
      "MainTorpRadar"
    )
  })

  it("DD & 魚1見水上電探 -> TorpLookoutRadar", () => {
    expect(getTypes({ shipType: ShipType.DD, torpedoCount: 1, hasSurfaceRadar: true, hasLookout: true })).toContain<
      NightSpecialAttackType
    >("TorpLookoutRadar")

    expect(getTypes({ torpedoCount: 1, hasSurfaceRadar: true, hasLookout: true })).not.toContain<
      NightSpecialAttackType
    >("TorpLookoutRadar")
  })

  it("主魚電と魚見電と主魚は重複する", () => {
    expect(
      getTypes({ shipType: ShipType.DD, mainGunCount: 1, torpedoCount: 1, hasSurfaceRadar: true, hasLookout: true })
    ).toEqual<NightSpecialAttackType[]>(["MainTorpRadar", "TorpLookoutRadar", "MainTorp"])
  })

  it("夜戦空母 & 夜戦2 & 夜攻1 -> AerialAttack1", () => {
    expect(getTypes({ isNightCarrier: true, nightFighterCount: 2, nightAttackerCount: 1 })).toContain("AerialAttack1")
  })

  it("夜戦空母 & 夜戦1 & 夜攻1 -> AerialAttack2", () => {
    expect(getTypes({ isNightCarrier: true, nightFighterCount: 1, nightAttackerCount: 1 })).toContain("AerialAttack2")
  })

  it("夜戦空母 & 光電管彗星 & (夜戦 + 夜攻)　>= 1 -> SuiseiAttack", () => {
    expect(getTypes({ isNightCarrier: true, hasFuzeBomber: true, nightFighterCount: 1 })).toContain("SuiseiAttack")
    expect(getTypes({ isNightCarrier: true, hasFuzeBomber: true, nightAttackerCount: 1 })).toContain("SuiseiAttack")
  })

  it("夜戦空母 & (夜戦 + 準夜間機) >= 3 -> AerialAttack3", () => {
    expect(getTypes({ isNightCarrier: true, nightFighterCount: 3 })).toContain("AerialAttack3")
    expect(getTypes({ isNightCarrier: true, nightFighterCount: 2, semiNightPlaneCount: 1 })).toContain("AerialAttack3")
  })

  it("夜戦空母 & 夜戦1 & (夜攻 + 準夜間機) >= 2 -> AerialAttack3", () => {
    expect(
      getTypes({ isNightCarrier: true, nightFighterCount: 1, nightAttackerCount: 1, semiNightPlaneCount: 1 })
    ).toContain("AerialAttack3")
    expect(getTypes({ isNightCarrier: true, nightFighterCount: 1, semiNightPlaneCount: 2 })).toContain("AerialAttack3")
    expect(getTypes({ isNightCarrier: true, nightFighterCount: 1, nightAttackerCount: 2 })).toContain("AerialAttack3")
  })

  it("夜戦空母でないなら夜襲CI不可", () => {
    expect(
      getTypes({ nightFighterCount: 2, nightAttackerCount: 2, hasFuzeBomber: true, semiNightPlaneCount: 2 })
    ).toHaveLength(0)
  })
})
