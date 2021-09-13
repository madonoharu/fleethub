import { Org } from "../node/index";

it("org", () => {
  const org = Org.default();
  expect(org.org_type).toBe("Single");
});
