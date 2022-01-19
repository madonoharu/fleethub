import { createAsyncThunk } from "@reduxjs/toolkit";
import { DefaultRootState } from "react-redux";
import { Entities } from "ts-norm";

import { publishFileData, tweet } from "../../utils";

import { getEntities } from "./entitiesSlice";
import { cloneAffectedEntities } from "./rtk-ts-norm";
import { FileEntity, schemata } from "./schemata";

export type PublicFile = {
  result: string;
  entities: Entities;
};

export const publishFile = createAsyncThunk(
  "entities/publishFile",
  async (arg: { fileId: string; tweets?: boolean }, thunkAPI) => {
    const { fileId, tweets } = arg;
    const root = thunkAPI.getState() as DefaultRootState;

    let count = 0;
    const idGenerator = () => `${(count++).toString(32)}`;

    const data: PublicFile = cloneAffectedEntities(
      fileId,
      schemata.file,
      getEntities(root.present.entities),
      idGenerator
    );

    const url = await publishFileData(data);

    if (tweets) {
      const entity = data.entities.files?.[data.result] as
        | FileEntity
        | undefined;
      const name = entity?.name || "";

      tweet({
        text: name && `【${name}】`,
        url,
      });
    }

    return url;
  }
);
