import murmurhash from "@emotion/hash";
import stringify from "fast-json-stable-stringify";

import { GCS_PREFIX_URL, publicFileExists } from "../firebase";
import { PublicFile } from "../store";

const origin = process.browser ? window.location.origin : "";
const PUBLIC_ID_KEY = "p";

export const publishFileData = async (data: PublicFile) => {
  const publicId = murmurhash(stringify(data));
  const url = new URL(origin);
  url.searchParams.set(PUBLIC_ID_KEY, publicId);

  if (await publicFileExists(publicId)) {
    return url.href;
  }

  const res = await fetch(`${origin}/api/publish`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      hash: publicId,
      data,
    }),
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return url.href;
};

export const readPublicFile = async (id: string): Promise<PublicFile> => {
  const res = await fetch(`${GCS_PREFIX_URL}/public/${id}.json`);
  const data = await res.json();
  return data as PublicFile;
};

export const getPublicId = (url: URL) => url.searchParams.get(PUBLIC_ID_KEY);
