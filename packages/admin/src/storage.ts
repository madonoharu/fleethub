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

export type Metadata = {
  generation: string;
};

export const BUCKET_NAME = "kcfleethub.appspot.com";
export const GCS_PREFIX_URL = `https://storage.googleapis.com/${BUCKET_NAME}`;
export const MASTER_DATA_PATH =
  process.env["MASTER_DATA_PATH"] || "data/master_data.json";

const getBucket = () => getApp().storage().bucket();

export function readJson<T>(path: string): Promise<T> {
  return got
    .get(`https://storage.googleapis.com/kcfleethub.appspot.com/${path}`)
    .json<T>();
}

export function exists(path: string): Promise<boolean> {
  return getBucket()
    .file(path)
    .exists()
    .then((res) => res[0]);
}

export async function getMetadata(path: string): Promise<Metadata> {
  const res = await getBucket().file(path).getMetadata();
  return res[0] as Metadata;
}

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

export const writeJson = async <T extends object>(
  path: string,
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

export async function updateJson<T extends object>(
  path: string,
  updater: (current: T | undefined) => T,
  options?: SaveOptions
): Promise<T> {
  let current: T | undefined;
  if (await exists(path)) {
    current = await readJson<T>(path);
  }

  const next = updater(current);

  if (!dequal(current, next)) {
    console.log(`update: ${path}`);
    await writeJson<T>(path, next, options);
  }

  return next;
}

export function readMasterData(): Promise<MasterData> {
  return readJson(MASTER_DATA_PATH);
}

export async function writeMasterData(data: MasterData): Promise<void> {
  await writeJson(
    MASTER_DATA_PATH,
    { ...data, created_at: Date.now() },
    {
      public: true,
      immutable: true,
    }
  );
}

export function equalMasterData(a: MasterData, b: MasterData): boolean {
  const { created_at: _a, ...omittedA } = a;
  const { created_at: _b, ...omittedB } = b;

  return dequal(omittedA, omittedB);
}

export async function mergeMasterData(
  target: MasterData,
  source: Partial<MasterData>
): Promise<MasterData> {
  const next: MasterData = { ...target, ...source };

  if (equalMasterData(target, next)) {
    return next;
  }

  console.log(`update: ${MASTER_DATA_PATH}`);

  await writeMasterData(next);

  return next;
}

export const fetchGenerationMap = async (): Promise<Record<string, string>> => {
  const api = got.extend({
    prefixUrl: `https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}/o`,
  });

  type ListResponse = {
    items: { name: string; generation: string }[];
  };

  const res = await api({
    searchParams: { prefix: "data" },
  }).json<ListResponse>();

  const result = Object.fromEntries(
    res.items.map((item) => [item.name, item.generation])
  );

  return result;
};
