import { Org } from "..";

it("org", () => {
  const org = Org.default();
  expect(org.org_type).toBe("Single");
});
