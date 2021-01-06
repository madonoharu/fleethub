import { uniq, sumBy, includes } from "../src"

describe("utils/array", () => {
  it("uniq", () => {
    const array = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
    expect(uniq(array)).toEqual([1, 2, 3, 4])
  })

  it("sumBy", () => {
    const array = [{ v: 1 }, { v: 2 }, { v: 3 }]
    expect(sumBy(array, (item) => item.v)).toBe(6)
  })

  it("includes", () => {
    expect(includes(["a", "b", "c"], "a")).toBe(true)
  })
})
