import { fhDefinitions, setFhOptions, FhOptions } from "./FhDefinitions"

describe("FhDefinitions", () => {
  it("setFhOptions で fhDefinitions を変更できる", () => {
    const options1: FhOptions = { formations: { LineAhead: { shelling: { power: 1.5, accuracy: 1.2 } } } }
    setFhOptions(options1)
    expect(fhDefinitions).toMatchObject(options1)

    const options2: FhOptions = { formations: { LineAhead: { shelling: { power: 1.8 } } } }
    setFhOptions(options2)
    expect(fhDefinitions).toMatchObject(options2)
  })
})
