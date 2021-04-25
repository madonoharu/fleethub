import { capitalize, uncapitalize } from "../src";

describe("utils/string", () => {
  it("capitalize", () => {
    expect(capitalize("red")).toBe("Red");
  });

  it("uncapitalize", () => {
    expect(uncapitalize("SkyBlue")).toBe("skyBlue");
  });
});
