import admin from "firebase-admin";
import { MasterData } from "fleethub-core";
import got from "got";
import isEqual from "lodash/isEqual";

import { getServiceAccount } from "./google";

let app: admin.app.App | undefined;
const getApp = () => {
  return (app ??= admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
    storageBucket: "kcfleethub.appspot.com",
  }));
};

export const getBucket = () => getApp().storage().bucket();

export const readJson = <T>(path: string) =>
  got
    .get(`https://storage.googleapis.com/kcfleethub.appspot.com/${path}`)
    .json<T>();

export const exists = (path: string): Promise<boolean> =>
  getBucket()
    .file(path)
    .exists()
    .then((res) => res[0]);

export const updateJson = async <T>(
  path: string,
  updater: (current: T | undefined) => T
): Promise<T> => {
  const file = getBucket().file(path);

  let current: T | undefined;
  if (await exists(path)) {
    current = await readJson<T>(path);
  }

  const next = updater(current);

  if (!isEqual(current, next)) {
    console.log(`update: ${path}`);
    const metadata = { cacheControl: "public, max-age=60" };
    await file.save(JSON.stringify(next), { metadata });
  }

  return next;
};

export const readMaster = <K extends keyof MasterData>(
  key: K
): Promise<MasterData[K]> => readJson(`data/${key}.json`);

export const write = <K extends keyof MasterData>(
  key: K,
  data: MasterData[K]
) => {
  const str = JSON.stringify(data);

  const destination = `data/${key}.json`;
  const metadata = { cacheControl: "public, max-age=60" };

  const bucket = getBucket();
  return bucket.file(destination).save(str, { metadata });
};

export const updateMaster = <K extends keyof MasterData>(
  key: K,
  cb: (current: MasterData[K] | undefined) => MasterData[K]
): Promise<MasterData[K]> => {
  return updateJson(`data/${key}.json`, cb);
};

const MASTER_DATA_KEYS = [
  "ships",
  "ship_attrs",
  "ship_banners",
  "gears",
  "gear_attrs",
  "ibonuses",
  "equippable",
  "constants",
] as const;

export const readMasterData = async (): Promise<MasterData> => {
  const entries = await Promise.all(
    MASTER_DATA_KEYS.map(async (key) => [key, await readMaster(key)])
  );
  return Object.fromEntries(entries) as MasterData;
};
