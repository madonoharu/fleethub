import { nanoid } from "@reduxjs/toolkit";
import { MasterData, OrgState } from "fleethub-core";
import { normalize } from "ts-norm";

import {
  createOrgStateByDeck,
  createOrgStateByJor,
  getPublicId,
  JorOrgState,
  MaybeDeck,
  readPublicFile,
} from "../utils";

import { ImportPayload } from "./entities/entitiesSlice";
import { cloneAffectedEntities } from "./entities/rtk-ts-norm";
import { FileState, schemata } from "./entities/schemata";

async function readJorShortUrl(short: URL) {
  const res = (await fetch(
    `/api/locate?url=${encodeURIComponent(short.toString())}`
  ).then((res) => res.json())) as { url?: string };

  if (typeof res.url !== "string") return;

  const long = new URL(res.url);

  const operationJson = long.searchParams.get("operation-json");
  let jorState: JorOrgState | undefined;

  if (operationJson) {
    jorState = JSON.parse(operationJson) as JorOrgState;
  }

  const path = long.searchParams.get("operation-path");
  if (path) {
    jorState = (await fetch(
      `https://storage.googleapis.com/jervis-6f57c.appspot.com/${path}`
    ).then((res) => res.json())) as JorOrgState;
  }

  if (!jorState) return;

  const org = createOrgStateByJor(jorState);

  const file: FileState = {
    type: "plan",
    id: nanoid(),
    name: jorState.name || "",
    description: jorState.description || "",
    org,
    steps: [],
  };

  return normalize(file, schemata.file);
}

export function parseDeckStr(masterData: MasterData, str: string) {
  let parsed: MaybeDeck;

  try {
    const url = new URL(str);
    const predeck = url.searchParams.get("predeck");
    parsed = JSON.parse(predeck || "") as MaybeDeck;
  } catch (_) {
    parsed = JSON.parse(str) as MaybeDeck;
  }

  const org = createOrgStateByDeck(masterData, parsed);

  const file: FileState = {
    type: "plan",
    id: nanoid(),
    name: "",
    description: "",
    org,
    steps: [],
  };

  return normalize(file, schemata.file);
}

export async function parseUrl(
  masterData: MasterData,
  url: URL
): Promise<ImportPayload | undefined> {
  const publicId = getPublicId(url);
  if (publicId) {
    const res = await readPublicFile(publicId);

    const cloned = cloneAffectedEntities(
      res.result,
      schemata.file,
      res.entities,
      nanoid
    );

    return cloned;
  }

  if (url.hostname === "jervis.page.link") {
    const res = await readJorShortUrl(url);
    return res;
  }

  const predeck = url.searchParams.get("predeck");
  if (predeck) {
    try {
      return parseDeckStr(masterData, predeck);
    } catch (err) {
      console.error(err);
    }
  }

  const org = url.searchParams.get("org");
  if (org) {
    const file: FileState = {
      type: "plan",
      id: nanoid(),
      name: "",
      description: "",
      org: JSON.parse(org) as OrgState,
      steps: [],
    };

    return normalize(file, schemata.file);
  }

  return;
}
