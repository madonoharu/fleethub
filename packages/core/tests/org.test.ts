import { Org } from "../node/fh_core";

it("org", () => {
  const org = Org.default();
  expect(org.org_type).toBe("Single");
});
