import { createAsyncThunk } from "@reduxjs/toolkit";
import { Entities } from "ts-norm";

import { publishFileData, tweet } from "../../utils";
import type { RootStateWithHistory } from "../createStore";

import { getEntities } from "./entitiesSlice";
import { cloneAffectedEntities } from "./rtk-ts-norm";
import { FileEntity, schemata } from "./schemata";

export type PublicFile = {
  result: string;
  entities: Entities;
};

export const publishFile = createAsyncThunk<
  string,
  { fileId: string; tweets?: boolean },
  { state: RootStateWithHistory }
>("entities/publishFile", async (arg, thunkAPI) => {
  const { fileId, tweets } = arg;
  const root = thunkAPI.getState().present;

  let count = 0;
  const idGenerator = () => `${(count++).toString(32)}`;

  const data: PublicFile = cloneAffectedEntities(
    fileId,
    schemata.file,
    getEntities(root.entities),
    idGenerator
  );

  const url = await publishFileData(data);

  if (tweets) {
    const entity = data.entities.files?.[data.result] as FileEntity | undefined;
    const name = entity?.name || "";

    tweet({
      text: name && `【${name}】`,
      url,
    });
  }

  return url;
});
