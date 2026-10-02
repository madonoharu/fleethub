import { describe, expect, it } from "bun:test";

import { createStore } from "../createStore";
import { entitiesSlice } from "./entitiesSlice";
import { filesSlice } from "./filesSlice";
import { cloneAffectedEntities } from "./rtk-ts-norm";
import { schemata, Step } from "./schemata";
import { selectActiveStep } from "./selectors";
import { stepsSlice } from "./stepsSlice";

function setup() {
  const store = createStore();
  const step: Step = { id: "step", name: "Boss", type: 4, d: undefined, org: { id: "enemy-org" } };
  store.dispatch(
    entitiesSlice.actions.createPlan({
      id: "plan",
      org: { id: "org" },
      steps: [step],
      activeStep: step,
    }),
  );
  return store;
}

describe("file cloning and active step selection", () => {
  it("copies shared steps only once and keeps cloned references independent of the original", () => {
    const store = setup();
    store.dispatch(entitiesSlice.actions.cloneFile("plan"));
    const root = store.getState().present;
    const copiedId = root.entities.files.rootIds[1];
    const copied = root.entities.files.entities[copiedId];
    if (copied.type !== "plan") throw new Error("Expected copied plan");
    expect(copied.activeStep).toBe(copied.steps[0]);
    expect(copied.steps[0]).not.toBe("step");
    expect(root.entities.steps.ids).toHaveLength(2);
    store.dispatch(
      stepsSlice.actions.update({ id: copied.steps[0], changes: { name: "Edited copy" } }),
    );
    expect(store.getState().present.entities.steps.entities.step.name).toBe("Boss");
    store.dispatch(filesSlice.actions.update({ id: copiedId, changes: { steps: [] } }));
    const next = store.getState().present;
    const file = next.entities.files.entities[copiedId];
    if (file.type !== "plan") throw new Error("Expected copied plan");
    expect(selectActiveStep(next, file)).toBeUndefined();
  });

  it("ignores stale activeStep references from older copies and picks an existing member step", () => {
    const store = setup();
    store.dispatch(
      entitiesSlice.actions.createPlan({
        id: "other",
        steps: [
          { id: "outside", name: "Other", type: 4, d: undefined, org: { id: "outside-org" } },
        ],
      }),
    );
    store.dispatch(
      filesSlice.actions.update({
        id: "plan",
        changes: { activeStep: "outside", steps: ["missing", "step"] },
      }),
    );
    const root = store.getState().present;
    const file = root.entities.files.entities.plan;
    if (file.type !== "plan") throw new Error("Expected plan");
    expect(selectActiveStep(root, file)?.id).toBe("step");
  });

  it("rejects cyclic public-file graphs instead of importing a recursive folder", () => {
    expect(() =>
      cloneAffectedEntities(
        "folder",
        schemata.file,
        {
          files: { folder: { id: "folder", type: "folder", children: ["folder"] } },
        },
        () => "copy",
      ),
    ).toThrow("Cyclic entity references");
  });
});
