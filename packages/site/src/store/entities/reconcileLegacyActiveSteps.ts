import { dequal } from "dequal";

import type { FileEntity, StepEntity } from "./schemata";

type EntityGraph = {
  files: { entities: Record<string, FileEntity | undefined> };
  steps: { entities: Record<string, StepEntity | undefined> };
};

function sameNode(left: StepEntity, right: StepEntity) {
  return (
    left.map === right.map &&
    left.node === right.node &&
    left.name === right.name &&
    left.type === right.type &&
    dequal(left.d, right.d)
  );
}

/** Reattach active nodes duplicated by the old file cloner, keeping their edits. */
export function reconcileLegacyActiveSteps<T extends EntityGraph>(state: T): T {
  const files = Object.values(state.files.entities);
  const owners = new Map<string, Set<string>>();
  for (const file of files) {
    if (file?.type !== "plan") continue;
    for (const id of [...file.steps, file.activeStep]) {
      if (!id) continue;
      const ids = owners.get(id) ?? new Set<string>();
      ids.add(file.id);
      owners.set(id, ids);
    }
  }

  let result = state;
  for (const file of files) {
    if (file?.type !== "plan") continue;
    const activeId = file.activeStep;
    if (!activeId || !file.steps.length || file.steps.includes(activeId)) continue;
    const active = state.steps.entities[activeId];
    if (!active || owners.get(activeId)?.size !== 1) continue;

    const matches = file.steps.filter((id) => {
      const step = state.steps.entities[id];
      return step && sameNode(step, active);
    });
    if (!matches.length) continue;

    // A unique match is the original list copy. With repeated map nodes the
    // old selected occurrence is unknowable, so preserve every existing node.
    const steps =
      matches.length === 1
        ? file.steps.map((id) => (id === matches[0] ? activeId : id))
        : [...file.steps, activeId];
    result = {
      ...result,
      files: {
        ...result.files,
        entities: { ...result.files.entities, [file.id]: { ...file, steps } },
      },
    };
  }
  return result;
}
