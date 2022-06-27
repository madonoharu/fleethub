import { nanoid } from "@reduxjs/toolkit";
import { normalize } from "ts-norm";

import { createOrgStateByJor, JorOrgState } from "../utils";

import { FileState, schemata } from "./entities/schemata";

export type JorData = {
  operations: JorOrgState[];
};

export function migrateFromJor(data: JorData) {
  const children = data.operations.map((o) => {
    const org = createOrgStateByJor(o);

    const file: FileState = {
      id: nanoid(),
      type: "plan",
      name: o.name || "",
      description: o.description || "",
      org,
      steps: [],
    };

    return file;
  });

  const folder: FileState = {
    id: nanoid(),
    type: "folder",
    name: "Jervis OR",
    description: "",
    children,
  };

  const normalized = normalize(folder, schemata.file);

  return {
    ...normalized,
    to: "root",
  };
}
