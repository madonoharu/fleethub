import Health from "./Health"

describe("ship/Health", () => {
  const less = new Health(100, 100)
  const shouha = new Health(100, 75)
  const chuuha = new Health(100, 50)
  const taiha = new Health(100, 25)
  const sunk = new Health(100, 0)

  it("damage", () => {
    expect(less.damage).toBe("Less")
    expect(shouha.damage).toBe("Shouha")
    expect(chuuha.damage).toBe("Chuuha")
    expect(taiha.damage).toBe("Taiha")
    expect(sunk.damage).toBe("Sunk")

    expect(new Health(100, 76).damage).toBe("Less")
    expect(new Health(100, 51).damage).toBe("Shouha")
    expect(new Health(100, 26).damage).toBe("Chuuha")
    expect(new Health(100, 1).damage).toBe("Taiha")
    expect(new Health(100, 0).damage).toBe("Sunk")
  })

  it("gte", () => {
    expect(less.gte("Less")).toBe(true)
    expect(shouha.gte("Shouha")).toBe(true)
    expect(chuuha.gte("Chuuha")).toBe(true)
    expect(taiha.gte("Taiha")).toBe(true)
    expect(sunk.gte("Sunk")).toBe(true)

    expect(chuuha.gte("Shouha")).toBe(false)
  })

  it("lte", () => {
    expect(less.lte("Less")).toBe(true)
    expect(shouha.lte("Shouha")).toBe(true)
    expect(chuuha.lte("Chuuha")).toBe(true)
    expect(taiha.lte("Taiha")).toBe(true)
    expect(sunk.lte("Sunk")).toBe(true)

    expect(chuuha.lte("Taiha")).toBe(false)
  })

  it("shellingPowerModifier", () => {
    const expectation: Array<[Health, number]> = [
      [less, 1],
      [shouha, 1],
      [chuuha, 0.7],
      [taiha, 0.4],
      [sunk, 0]
    ]
    expectation.forEach(([health, value]) => {
      expect(health.shellingPowerModifier).toBe(value)
    })
  })

  it("torpedoPowerModifier", () => {
    const expectation: Array<[Health, number]> = [
      [less, 1],
      [shouha, 1],
      [chuuha, 0.8],
      [taiha, 0],
      [sunk, 0]
    ]
    expectation.forEach(([health, value]) => {
      expect(health.torpedoPowerModifier).toBe(value)
    })
  })

  it("nightAttackPowerModifier", () => {
    const expectation: Array<[Health, number]> = [
      [less, 1],
      [shouha, 1],
      [chuuha, 0.7],
      [taiha, 0],
      [sunk, 0]
    ]
    expectation.forEach(([health, value]) => {
      expect(health.nightAttackPowerModifier).toBe(value)
    })
  })
})
