import { add } from "lodash-es";
import { Org } from "../node/index";

it("org", () => {
  add(1, 1);
  const org = Org.default();
  expect(org.org_type).toBe("Single");
});
