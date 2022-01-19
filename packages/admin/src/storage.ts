import zlib from "zlib";

import { SaveOptions as GcsSaveOptions } from "@google-cloud/storage";
import { dequal } from "dequal";
import { MasterData } from "fleethub-core";
import got from "got";

import { getApp } from "./credentials";

export interface SaveOptions extends GcsSaveOptions {
  brotli?: boolean | undefined;
  immutable?: boolean | undefined;
  metadata?: Record<string, string>;
}

export const BUCKET_NAME = "kcfleethub.appspot.com";
export const GCS_PREFIX_URL = `https://storage.googleapis.com/${BUCKET_NAME}`;
export const MASTER_DATA_PATH = "data/master_data.json";

export const getBucket = () => getApp().storage().bucket();

export const readJson = <
  P extends string,
  T extends P extends typeof MASTER_DATA_PATH ? MasterData : unknown
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

export type Metadata = {
  generation: string;
};

export const getMetadata = async (path: string): Promise<Metadata> => {
  const res = await getBucket().file(path).getMetadata();
  return res[0] as Metadata;
};

const createGcsSaveOptions = (options?: SaveOptions): GcsSaveOptions => {
  const result: SaveOptions = { ...options };

  if (!result.metadata) {
    result.metadata = {};
  }

  if (result.immutable) {
    result.metadata.cacheControl = "public, immutable, max-age=365000000";
  }

  if (result.brotli) {
    result.gzip = false;
    result.metadata.contentEncoding = "br";
  }

  return result;
};

export const write = async (
  path: string,
  data: string | Buffer,
  options?: SaveOptions
) => {
  const file = getBucket().file(path);

  if (options?.brotli) {
    data = zlib.brotliCompressSync(data);
  }

  await file.save(data, createGcsSaveOptions(options));
};

export const writeJson = async <
  P extends string,
  T extends P extends typeof MASTER_DATA_PATH ? MasterData : object
>(
  path: P,
  data: T,
  options?: SaveOptions
): Promise<T> => {
  await write(path, JSON.stringify(data), {
    contentType: "application/json",
    brotli: true,
    ...options,
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

  if (!dequal(current, next)) {
    console.log(`update: ${path}`);
    await writeJson<P, T>(path, next, options);
  }

  return next;
};

export const readMasterData = () => readJson(MASTER_DATA_PATH);

export const mergeMasterData = async (
  target: MasterData,
  source: Partial<MasterData>
): Promise<MasterData> => {
  const next: MasterData = { ...target, ...source };

  if (dequal(target, next)) {
    return next;
  }

  console.log(`update: ${MASTER_DATA_PATH}`);

  await writeJson(MASTER_DATA_PATH, next, {
    public: true,
    immutable: true,
  });

  return next;
};

export const fetchGenerationMap = async (): Promise<Record<string, string>> => {
  const api = got.extend({
    prefixUrl: `https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}/o`,
  });

  type ListResponse = {
    items: { name: string; generation: string }[];
  };

  const res1 = await api({
    searchParams: { prefix: "maps" },
  }).json<ListResponse>();

  const res2 = await api({
    searchParams: { prefix: "data" },
  }).json<ListResponse>();

  const result = Object.fromEntries(
    res1.items.concat(res2.items).map((item) => [item.name, item.generation])
  );

  return result;
};
