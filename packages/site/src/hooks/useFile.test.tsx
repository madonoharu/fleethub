import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";

import { createStore, filesSlice } from "../store";

import { useFileCanDrop } from "./useFile";

function setup() {
  const store = createStore();
  const createFolder = (to?: string) => {
    store.dispatch(filesSlice.actions.createFolder(to));
    const id = store.getState().present.entities.files.ids.at(-1);
    if (typeof id !== "string") throw new Error("Folder must have a string ID");
    return store.getState().present.entities.files.entities[id];
  };
  const parent = createFolder();
  const child = createFolder(parent.id);
  const sibling = createFolder();
  const file = (id: string) => store.getState().present.entities.files.entities[id];
  const hook = renderHook(() => useFileCanDrop(child.id), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });
  const rename = (id: string) =>
    act(() => {
      store.dispatch(filesSlice.actions.update({ id, changes: { name: "Renamed" } }));
    });
  return { parent, child, sibling, file, hook, rename };
}

describe("file drag targets across immutable updates", () => {
  it("rejects dropping a folder onto itself after it is renamed during a drag", () => {
    const { child, file, hook, rename } = setup();
    const dragged = file(child.id);
    expect(hook.result.current.canDrop(dragged)).toBe(false);

    rename(child.id);

    expect(file(child.id)).not.toBe(dragged);
    expect(hook.result.current.canDrop(dragged)).toBe(false);
  });

  it("rejects dropping a renamed ancestor into its descendant", () => {
    const { parent, file, hook, rename } = setup();
    const dragged = file(parent.id);
    expect(hook.result.current.canDrop(dragged)).toBe(false);

    rename(parent.id);

    expect(file(parent.id)).not.toBe(dragged);
    expect(hook.result.current.canDrop(dragged)).toBe(false);
  });

  it("continues accepting a sibling folder after it is renamed during a drag", () => {
    const { sibling, file, hook, rename } = setup();
    const dragged = file(sibling.id);
    expect(hook.result.current.canDrop(dragged)).toBe(true);

    rename(sibling.id);

    expect(file(sibling.id)).not.toBe(dragged);
    expect(hook.result.current.canDrop(dragged)).toBe(true);
  });
});
