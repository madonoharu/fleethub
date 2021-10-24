import murmurhash from "@emotion/hash";
import {
  StringFormat,
  uploadString,
  ref,
  StorageError,
} from "@firebase/storage";
import objectHash from "object-hash";

import { publicStorageRef } from "../firebase";
import { PublicFile } from "../store";

const origin = process.browser ? window.location.origin : "";
const PUBLIC_ID_KEY = "publicId";

const hash = (data: Record<string, unknown>): string => {
  let str = "";
  objectHash.writeToStream(
    data,
    { respectType: false },
    {
      update: (chunk, _encoding, _cb) => {
        str += chunk;
      },
    }
  );

  return murmurhash(str);
};

export const publishFileData = async (data: PublicFile) => {
  const publicId = hash(data);
  const fileRef = ref(publicStorageRef, `${publicId}.json`);

  await uploadString(fileRef, JSON.stringify(data), StringFormat.RAW, {
    contentType: "application/json",
    cacheControl: "public, immutable, max-age=365000000",
  }).catch((err: StorageError) => {
    if (err.code !== "storage/unauthorized") {
      throw err;
    }
  });

  const url = new URL(origin);
  url.searchParams.set(PUBLIC_ID_KEY, publicId);

  return url.href;
};

export const readPublicFile = async (id: string): Promise<PublicFile> => {
  const res = await fetch(
    `https://storage.googleapis.com/kcfleethub.appspot.com/public/${id}.json`
  );
  const data = await res.json();
  return data as PublicFile;
};

export const getPublicId = (url: URL) => url.searchParams.get(PUBLIC_ID_KEY);

export const fetchPublicFile = async (
  arg: URL | string
): Promise<PublicFile | undefined> => {
  const url = typeof arg === "string" ? new URL(arg) : arg;

  const id = url.searchParams.get(PUBLIC_ID_KEY);

  if (id) {
    return await readPublicFile(id);
  }

  return;
};

type TweetOption = {
  text: string;
  url: string;
};

export const tweet = ({ text, url }: TweetOption) => {
  const tweetUrl = new URL("https://twitter.com/intent/tweet");
  tweetUrl.searchParams.set("text", text);
  tweetUrl.searchParams.set("url", url);
  window.open(tweetUrl.href, "_blank", "width=480,height=400,noopener");
};
