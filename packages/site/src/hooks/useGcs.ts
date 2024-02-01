import { Dict, isUnknownRecord } from "@fh/utils";
import { MasterData } from "fleethub-core";
import React from "react";
import { SWRResponse } from "swr";
import useSWRImmutable from "swr/immutable";

import { GCS_PREFIX_URL, MASTER_DATA_PATH } from "../firebase";

type FetcherArg = readonly [string, string | undefined];

export const GenerationMapContext = React.createContext<Dict<string, string>>(
  {},
);

export async function gcsFetcher<T>([
  path,
  generation,
]: FetcherArg): Promise<T> {
  const url = new URL(`${GCS_PREFIX_URL}/${path}`);

  if (generation) {
    url.searchParams.set("generation", generation);
  }

  const res = await fetch(url.href);
  const json = (await res.json()) as T;

  if (isUnknownRecord(json) && typeof json.created_at === "number") {
    console.info(path, new Date(json.created_at).toLocaleString());
  }

  return json;
}

export function useGcs<T>(path: string): SWRResponse<T, Error> {
  const generationMap = React.useContext(GenerationMapContext);
  const key: FetcherArg = [path, generationMap[path]];

  return useSWRImmutable<T, Error, FetcherArg>(key, gcsFetcher);
}

export function useMasterData(): SWRResponse<MasterData, Error> {
  return useGcs<MasterData>(MASTER_DATA_PATH);
}
