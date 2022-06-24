import { compress } from "@fh/utils";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytes,
  UploadMetadata,
  uploadString,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCTRbVqrTpJH2VNisHn7Zxb50bAQ-M80aA",
  authDomain: "kcfleethub.firebaseapp.com",
  databaseURL: "https://kcfleethub.firebaseio.com",
  projectId: "kcfleethub",
  storageBucket: "kcfleethub.appspot.com",
  messagingSenderId: "154546542358",
  appId: "1:154546542358:web:be495b1b23c20c66c82237",
  measurementId: "G-9F914T0225",
};

export const firebaseApp = initializeApp(firebaseConfig);

if (typeof window !== "undefined") {
  getAnalytics();
}

export const GCS_PREFIX_URL =
  "https://storage.googleapis.com/kcfleethub.appspot.com";
export const MASTER_DATA_PATH = "data/master_data.json";
export const SHIP_BANNERS_PATH = "data/ship_banners.json";

export const publicFileExists = (id: string) => {
  return fetch(`${GCS_PREFIX_URL}/public/${id}.json`, { method: "HEAD" }).then(
    (res) => res.status === 200
  );
};

const storage = getStorage();
export const publicStorageRef = ref(storage, "public");

export const shorten = async (url: string, domain: "fleethub") => {
  const apiKey = firebaseConfig.apiKey;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const body = {
    longDynamicLink: `https://${domain}.page.link/?link=${url}`,
    suffix: {
      option: "SHORT",
    },
  };

  const res = await fetch(
    `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${apiKey}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );
  const json = (await res.json()) as
    | { previewLink: string; shortLink: string }
    | { error: { code: number } };
  return json;
};

export async function publish(
  name: string,
  input: string,
  customMetadata?: Record<string, string>
) {
  const out = ref(storage, `public/${name}`);
  const metadata: UploadMetadata = {
    contentType: "application/json",
    cacheControl: "public, immutable, max-age=365000000",
    customMetadata,
  };

  if (compress.supports) {
    const data = await compress(input);
    metadata.contentEncoding = "gzip";

    return await uploadBytes(out, data, metadata);
  } else {
    return await uploadString(out, input, undefined, metadata);
  }
}
