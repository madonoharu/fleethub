import murmurhash from "@emotion/hash";
import stringify from "fast-json-stable-stringify";

import { GCS_PREFIX_URL, publicFileExists, publish } from "../firebase";
import { PublicFile } from "../store";

const origin = typeof window !== "undefined" ? window.location.origin : "";
const PUBLIC_ID_KEY = "p";

export const publishFileData = async (data: PublicFile) => {
  const str = stringify(data);
  const id = murmurhash(str);
  const url = new URL(origin);
  url.searchParams.set(PUBLIC_ID_KEY, id);

  if (await publicFileExists(id)) {
    return url.href;
  }

  await publish(`${id}.json`, str);

  return url.href;
};

export const readPublicFile = async (id: string): Promise<PublicFile> => {
  const res = await fetch(`${GCS_PREFIX_URL}/public/${id}.json`);
  const data = await res.json();
  return data as PublicFile;
};

export const getPublicId = (url: URL) => url.searchParams.get(PUBLIC_ID_KEY);
