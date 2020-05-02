import { getApShellModifiers } from "./ApShellModifiers"

type Expected = ReturnType<typeof getApShellModifiers>

describe("getApShellModifiers", () => {
  it("徹甲弾補正は徹甲弾と主砲が必要", () => {
    const expected: Expected = { power: 1, accuracy: 1 }

    expect(
      getApShellModifiers({
        hasApShell: false,
        hasMainGun: true,
        hasRader: true,
        hasSecondaryGun: true,
      })
    ).toEqual(expected)

    expect(
      getApShellModifiers({
        hasApShell: true,
        hasMainGun: false,
        hasRader: true,
        hasSecondaryGun: true,
      })
    ).toEqual(expected)
  })
  it.each<[boolean, boolean, Expected]>([
    [false, false, { power: 1.08, accuracy: 1.1 }],
    [true, false, { power: 1.1, accuracy: 1.25 }],
    [false, true, { power: 1.15, accuracy: 1.2 }],
    [true, true, { power: 1.15, accuracy: 1.3 }],
  ])("電探%s, 副砲%s -> %s", (hasRader, hasSecondaryGun, expected) => {
    const modifiers = getApShellModifiers({ hasApShell: true, hasMainGun: true, hasRader, hasSecondaryGun })
    expect(modifiers).toEqual(expected)
  })
})
