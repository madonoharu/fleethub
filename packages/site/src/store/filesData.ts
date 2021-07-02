import { OrgParams } from "@fleethub/core";
import { nanoid } from "@reduxjs/toolkit";

import { FileEntity, isDirectory } from "./filesSlice";

export type OrgParamsWithId = OrgParams & { id: string };

export type FilesData = {
  id: string;
  files: FileEntity[];
  orgs?: OrgParamsWithId[];
};

const replaceAll = <T>(array: T[], searchValue: T, replaceValue: T) => {
  const cloned = array.concat();

  cloned.forEach((item, index) => {
    if (item === searchValue) cloned[index] = replaceValue;
  });

  return cloned;
};

export const cloneFilesData = ({ id, files, orgs }: FilesData): FilesData => {
  const changes: Array<[string, string]> = files.map((file) => [
    file.id,
    nanoid(),
  ]);
  const nextId = changes.find((change) => change[0] === id)?.[1] || "";

  const cloneEntity = <T extends { id: string }>(entity: T) => {
    const change = changes.find(([prevId]) => entity.id === prevId);
    const nextId = change ? change[1] : "";
    return { ...entity, id: nextId };
  };

  const clonedFiles = files.map(cloneEntity);
  const clonedOrgs = orgs?.map(cloneEntity);

  const dirs = clonedFiles.filter(isDirectory);
  changes.forEach((change) => {
    dirs.forEach((dir) => {
      dir.children = replaceAll(dir.children, ...change);
    });
  });

  return { id: nextId, files: clonedFiles, orgs: clonedOrgs };
};
