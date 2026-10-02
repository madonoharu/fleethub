import { describe, expect, it } from "bun:test";

import { entitiesSlice } from "./entitiesSlice";

function setup(): ReturnType<typeof entitiesSlice.getInitialState> {
  const initial = entitiesSlice.getInitialState();
  return {
    ...initial,
    files: {
      ...initial.files,
      ids: ["folder", "existing-plan", "later-plan"],
      rootIds: ["folder"],
      entities: {
        folder: {
          id: "folder",
          type: "folder",
          name: "Folder",
          description: "",
          children: ["existing-plan", "later-plan"],
        },
        "existing-plan": {
          id: "existing-plan",
          type: "plan",
          name: "Existing plan",
          description: "",
          org: "existing-org",
          steps: [],
        },
        "later-plan": {
          id: "later-plan",
          type: "plan",
          name: "Later plan",
          description: "",
          org: "existing-org",
          steps: [],
        },
      },
    },
  };
}

function createPlan(to?: string) {
  return entitiesSlice.reducer(
    setup(),
    entitiesSlice.actions.createPlan(
      { id: "new-plan", name: "New plan", org: { id: "new-org" } },
      to,
    ),
  );
}

describe("new plan placement", () => {
  it("appends a plan inside the selected folder without adding it to the root", () => {
    const state = createPlan("folder");

    expect(state.files.entities.folder).toMatchObject({
      type: "folder",
      children: ["existing-plan", "later-plan", "new-plan"],
    });
    expect(state.files.rootIds).toEqual(["folder"]);
    expect(state.files.entities["new-plan"]).toMatchObject({
      type: "plan",
      org: "new-org",
      name: "New plan",
    });
  });

  it("places a plan after the selected plan in the same parent folder", () => {
    const state = createPlan("existing-plan");

    expect(state.files.entities.folder).toMatchObject({
      children: ["existing-plan", "new-plan", "later-plan"],
    });
    expect(state.files.rootIds).toEqual(["folder"]);
  });

  it("appends a plan to the root when no destination is selected", () => {
    const state = createPlan();

    expect(state.files.rootIds).toEqual(["folder", "new-plan"]);
    expect(state.files.entities.folder).toMatchObject({
      children: ["existing-plan", "later-plan"],
    });
  });
});
