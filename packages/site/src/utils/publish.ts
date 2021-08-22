import murmurhash2_32_gc from "@emotion/hash";
import { nanoid } from "@reduxjs/toolkit";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string-uri-fix";
import objectHash from "object-hash";

import { firebase, publicStorageRef } from "../firebase";
import { PublicData } from "../store";

const origin = process.browser ? window.location.origin : "";
const dataParamKey = "data";
const PUBLIC_ID_KEY = "publicId";

const hash = (data: Record<string, unknown>): string => {
  // return objectHash(data, { respectType: false, encoding: "base64" });
  let str = "";
  objectHash.writeToStream(
    data,
    { respectType: false },
    {
      update: (chunk, encoding, cb) => {
        str += chunk;
      },
    }
  );

  return murmurhash2_32_gc(str);
};

export const publishFileData = async (data: PublicData) => {
  const publicId = hash(data);

  await publicStorageRef
    .child(`${publicId}.json`)
    .putString(JSON.stringify(data), firebase.storage.StringFormat.RAW, {
      contentType: "application/json",
      cacheControl: "public, immutable, max-age=365000000",
    })
    .catch((err) => {
      if (err.code !== "storage/unauthorized") {
        throw err;
      }
    });

  const url = new URL(origin);
  url.searchParams.set(PUBLIC_ID_KEY, publicId);

  return url.href;
};

export const fetchUrlData = async (
  arg: URL | string
): Promise<PublicData | undefined> => {
  const url = typeof arg === "string" ? new URL(arg) : arg;

  const getParam = (key: string) => {
    const value = url.searchParams.get(key);
    url.searchParams.delete(key);
    return value;
  };

  const fileId = getParam(PUBLIC_ID_KEY);
  if (fileId) {
    const res = await fetch(
      `https://storage.googleapis.com/kcfleethub.appspot.com/public/${fileId}.json`
    );
    const data = await res.json();
    return data as PublicData;
  }

  const dataParam = getParam(dataParamKey);
  if (dataParam) {
    try {
      return JSON.parse(
        decompressFromEncodedURIComponent(dataParam)
      ) as PublicData;
    } catch (error) {
      console.warn(error);
      return;
    }
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
