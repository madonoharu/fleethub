import stringify from "fast-json-stable-stringify";
import { h64 } from "xxhashjs";

import { GCS_PREFIX_URL, publicFileExists, publish } from "../firebase";
import { PublicFile } from "../store";

const origin = typeof window !== "undefined" ? window.location.origin : "";
const PUBLIC_ID_KEY = "p";

export const publishFileData = async (data: PublicFile) => {
  const str = stringify(data);

  const buf = Buffer.from(h64(0).update(str).digest().toString(16), "hex");

  const base64url = buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const url = new URL(origin);
  url.searchParams.set(PUBLIC_ID_KEY, base64url);

  if (await publicFileExists(base64url)) {
    return url.href;
  }

  await publish(`${base64url}.json`, str);

  return url.href;
};

export const readPublicFile = async (id: string): Promise<PublicFile> => {
  const res = await fetch(`${GCS_PREFIX_URL}/public/${id}.json`);
  const data = (await res.json()) as PublicFile;
  return data;
};

export const getPublicId = (url: URL) => url.searchParams.get(PUBLIC_ID_KEY);
