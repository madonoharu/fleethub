import RateMap from "./RateMap"

describe("RateMap", () => {
  const rateMap = new RateMap<string>()
  rateMap.set("key1", 0.1)
  expect(rateMap.total).toBe(0.1)
  expect(rateMap.complement).toBe(1 - 0.1)

  rateMap.set("key2", 0.2)
  expect(rateMap.total).toBe(0.1 + 0.2)
  expect(rateMap.complement).toBe(1 - rateMap.total)
})
