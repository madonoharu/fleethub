import { isNonNullable, range } from "../src"

describe("utils/misc", () => {
  it("range", () => {
    expect(range(5)).toEqual([0, 1, 2, 3, 4])
  })

  it("cloneJson", () => {
    expect(isNonNullable(0)).toBe(true)
    expect(isNonNullable(false)).toBe(true)
    expect(isNonNullable("")).toBe(true)
    expect(isNonNullable(undefined)).toBe(false)
    expect(isNonNullable(null)).toBe(false)
  })
})
