import { Dict, FhMap } from "@fh/utils";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";
import { MasterData } from "fleethub-core";

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

if (process.browser) {
  getAnalytics();
}

export const GCS_PREFIX_URL =
  "https://storage.googleapis.com/kcfleethub.appspot.com";
export const MASTER_DATA_PATH = "data/master_data.json";

export const fetchMasterData = async (): Promise<MasterData> =>
  fetch(`${GCS_PREFIX_URL}/${MASTER_DATA_PATH}`).then((res) =>
    res.json()
  ) as Promise<MasterData>;

export type MapVersion = Dict<string, string>;

export const fetchMapVersion = (): Promise<MapVersion> => {
  return fetch(`${GCS_PREFIX_URL}/maps/all.json`).then((res) =>
    res.json()
  ) as Promise<MapVersion>;
};

export const fetchMap = async (id: number) => {
  const version = await fetchMapVersion();
  const generation = version[id] || "";
  const params = new URLSearchParams({ generation });

  return fetch(`${GCS_PREFIX_URL}/maps/${id}.json?${params.toString()}`).then(
    (res) => res.json()
  ) as Promise<FhMap>;
};

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
