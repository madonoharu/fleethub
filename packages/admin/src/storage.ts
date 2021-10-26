import { SaveOptions } from "@google-cloud/storage";
import { MasterData } from "fleethub-core";
import got from "got";
import isEqual from "lodash/isEqual";

import { getApp } from "./credentials";

export const getBucket = () => getApp().storage().bucket();

export const readJson = <
  P extends string,
  T extends P extends "data/master_data.json" ? MasterData : unknown
>(
  path: P
) =>
  got
    .get(`https://storage.googleapis.com/kcfleethub.appspot.com/${path}`)
    .json<T>();

export const exists = (path: string): Promise<boolean> =>
  getBucket()
    .file(path)
    .exists()
    .then((res) => res[0]);

export const writeJson = async <
  P extends string,
  T extends P extends "data/master_data.json" ? MasterData : unknown
>(
  path: P,
  data: T,
  options?: SaveOptions
): Promise<T> => {
  const file = getBucket().file(path);

  await file.save(JSON.stringify(data), options);

  return data;
};

export const updateJson = async <
  P extends string,
  T extends P extends "data/master_data.json" ? MasterData : unknown
>(
  path: P,
  updater: (current: T | undefined) => T,
  options?: SaveOptions
): Promise<T> => {
  let current: T | undefined;
  if (await exists(path)) {
    current = await readJson<P, T>(path);
  }

  const next = updater(current);

  if (!isEqual(current, next)) {
    console.log(`update: ${path}`);
    await writeJson<P, T>(path, next, options);
  }

  return next;
};

export const mergeMasterData = (
  next: Partial<MasterData>
): Promise<MasterData> =>
  updateJson(
    "data/master_data.json",
    (current) => {
      if (!current) {
        throw new Error("data/master_data.json was not found");
      }

      return { ...current, ...next };
    },
    {
      gzip: true,
      metadata: {
        cacheControl: "no-store",
      },
    }
  );
