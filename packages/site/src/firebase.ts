import { MasterData, OrgState } from "@fh/core";
import { FhMap } from "@fh/utils";
import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";

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

export const fetchMasterData = async (): Promise<MasterData> => {
  const entries = await Promise.all(
    MASTER_DATA_KEYS.map(async (key) => {
      const res = await fetch(
        `https://storage.googleapis.com/kcfleethub.appspot.com/data/${key}.json`
      );

      return [key, await res.json()] as const;
    })
  );

  return Object.fromEntries(entries) as MasterData;
};

export const fetchMap = (id: number) =>
  fetch(
    `https://storage.googleapis.com/kcfleethub.appspot.com/maps/${id}.json`
  ).then((res) => res.json()) as Promise<FhMap>;

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

type FhFolder = {
  id: string;
  type: "folder";
  children: FhFile[];
};

type FhPlanFile = {
  id: string;
  type: "plan";
  data: OrgState;
};

type FhFile = FhPlanFile | FhFolder;
