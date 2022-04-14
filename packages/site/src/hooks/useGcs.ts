import { Dict } from "@fh/utils";
import React from "react";
import useSWRImmutable from "swr/immutable";

import { GCS_PREFIX_URL } from "../firebase";

export const GenerationMapContext = React.createContext<Dict<string, string>>(
  {}
);

export async function gcsFetcher<T>(
  path: string,
  generation?: string
): Promise<T> {
  const url = new URL(`${GCS_PREFIX_URL}/${path}`);

  if (generation) {
    url.searchParams.set("generation", generation);
  }

  const res = await fetch(url.href);
  return (await res.json()) as T;
}

export function useGcs<T>(path: string) {
  const generationMap = React.useContext(GenerationMapContext);
  return useSWRImmutable<T, Error>([path, generationMap[path]], gcsFetcher);
}
