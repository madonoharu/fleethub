import { promisify } from "util";
import zlib from "zlib";
import { SaveOptions } from "@google-cloud/storage";
import { MasterData } from "fleethub-core";
import got from "got";
import isEqual from "lodash/isEqual";

import { getApp } from "./credentials";

const MASTER_DATA_PATH = "data/master_data.json";

const brotliCompress = promisify(zlib.brotliCompress);

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

export const write = async (
  path: string,
  data: string | Buffer,
  options?: SaveOptions
) => {
  const file = getBucket().file(path);
  await file.save(data, options);
};

export const writeJson = async <
  P extends string,
  T extends P extends typeof MASTER_DATA_PATH ? MasterData : object
>(
  path: P,
  data: T,
  options?: SaveOptions
): Promise<T> => {
  const str = JSON.stringify(data);
  const compressed = await brotliCompress(str);

  await write(path, compressed, {
    ...options,
    gzip: false,
    contentType: "application/json",
    metadata: {
      ...options?.metadata,
      contentEncoding: "br",
    },
  });

  return data;
};

export const updateJson = async <
  P extends string,
  T extends P extends typeof MASTER_DATA_PATH ? MasterData : object
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

export const mergeMasterData = async (
  input: Partial<MasterData>
): Promise<MasterData> => {
  const current = await readJson(MASTER_DATA_PATH);
  const next: MasterData = { ...current, ...input };

  if (isEqual(current, next)) {
    return next;
  }

  console.log(`update: ${MASTER_DATA_PATH}`);

  const cacheControl = "public, max-age=60";
  await writeJson(MASTER_DATA_PATH, next, {
    metadata: { cacheControl },
  });

  return next;
};
