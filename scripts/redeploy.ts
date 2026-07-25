import { setTimeout as sleep } from "node:timers/promises";

// ---- 設定 -------------------------------------------------------------

/** プロジェクト名 または プロジェクト ID (prj_...) */
const PROJECT = "fleethub";

/** デプロイ先環境 */
const TARGET: Target = "production";

/** チームの slug または ID。個人アカウントなら undefined */
const TEAM: string | undefined = undefined;

/** true にすると元デプロイのコミットではなくブランチ最新コミットでビルドする */
const WITH_LATEST_COMMIT = false;

/** true にすると完了までポーリングする */
const WAIT = true;

/** WAIT 時のタイムアウト (ミリ秒) */
const TIMEOUT_MS = 900_000;

/** WAIT 時のポーリング間隔 (ミリ秒) */
const INTERVAL_MS = 10_000;

// ---- 実装 -------------------------------------------------------------

const API_BASE = "https://api.vercel.com";
const TERMINAL_STATES = new Set(["READY", "ERROR", "CANCELED", "DELETED"]);

type Target = "production" | "preview";

/** GET /v7/deployments のレスポンス要素 (使うフィールドのみ) */
interface ListedDeployment {
  uid: string;
  name: string;
  url?: string;
  readyState?: string;
}

/** GET/POST /v13/deployments のレスポンス (使うフィールドのみ) */
interface Deployment {
  id: string;
  name: string;
  url?: string;
  readyState?: string;
  inspectorUrl?: string;
  errorMessage?: string;
}

interface RequestOptions {
  token: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

class VercelError extends Error {}

async function request<T>(
  method: "GET" | "POST",
  path: string,
  { token, query, body }: RequestOptions,
): Promise<T> {
  const url = new URL(path, API_BASE);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new VercelError(`${method} ${path} -> HTTP ${res.status}\n${text}`);
  }
  return (text === "" ? {} : JSON.parse(text)) as T;
}

/** プロジェクトの直近の READY なデプロイを 1 件返す。 */
async function findLatestDeployment(token: string): Promise<ListedDeployment> {
  // projectId は ID でも名前でも受け付けないケースがあるため、
  // prj_ で始まる場合のみ projectId、それ以外は app (プロジェクト名) を使う。
  const query: Record<string, string | number | undefined> = {
    limit: 1,
    target: TARGET,
    state: "READY",
    teamId: TEAM,
  };
  if (PROJECT.startsWith("prj_")) {
    query.projectId = PROJECT;
  } else {
    query.app = PROJECT;
  }

  const res = await request<{ deployments?: ListedDeployment[] }>(
    "GET",
    "/v7/deployments",
    {
      token,
      query,
    },
  );
  const deployment = res.deployments?.[0];
  if (deployment === undefined) {
    throw new VercelError(
      `project=${PROJECT} target=${TARGET} に READY なデプロイが見つかりません`,
    );
  }
  return deployment;
}

async function redeploy(
  token: string,
  name: string,
  deploymentId: string,
): Promise<Deployment> {
  const body: Record<string, unknown> = {
    name, // 必須: デプロイ URL に使われるプロジェクト名
    deploymentId, // これを渡すと既存デプロイの再デプロイになる
    target: TARGET,
  };
  if (WITH_LATEST_COMMIT) {
    // 元デプロイの gitSource.sha を外し、ブランチの最新コミットでビルドさせる
    body.withLatestCommit = true;
  }

  return request<Deployment>("POST", "/v13/deployments", {
    token,
    // forceNew=1 で重複排除を回避し、必ず新規ビルドを走らせる
    query: { forceNew: "1", teamId: TEAM },
    body,
  });
}

async function waitForReady(
  token: string,
  deploymentId: string,
): Promise<Deployment> {
  const deadline = Date.now() + TIMEOUT_MS;
  let lastState: string | undefined;

  for (;;) {
    const res = await request<Deployment>(
      "GET",
      `/v13/deployments/${deploymentId}`,
      {
        token,
        query: { teamId: TEAM },
      },
    );
    const state = res.readyState;
    if (state !== lastState) {
      console.log(`  state: ${state}`);
      lastState = state;
    }
    if (state !== undefined && TERMINAL_STATES.has(state)) return res;
    if (Date.now() >= deadline) {
      throw new VercelError(
        `${TIMEOUT_MS / 1000}s 以内に完了しませんでした (state=${state})`,
      );
    }
    await sleep(INTERVAL_MS);
  }
}

async function main(): Promise<number> {
  const token = process.env.VERCEL_TOKEN;
  if (token === undefined || token === "") {
    console.error("環境変数 VERCEL_TOKEN が設定されていません");
    return 2;
  }

  const source = await findLatestDeployment(token);
  console.log(`再デプロイ元: ${source.uid} (${source.name}, target=${TARGET})`);
  if (source.url !== undefined) console.log(`  url: https://${source.url}`);

  const res = await redeploy(token, source.name, source.uid);
  console.log(`再デプロイを開始しました: ${res.id}`);
  if (res.url !== undefined) console.log(`  url: https://${res.url}`);
  if (res.inspectorUrl !== undefined)
    console.log(`  inspector: ${res.inspectorUrl}`);

  if (!WAIT) return 0;

  console.log("完了を待機中...");
  const final = await waitForReady(token, res.id);
  if (final.readyState !== "READY") {
    console.error(
      `デプロイは READY になりませんでした: ${final.readyState} ${final.errorMessage ?? ""}`.trim(),
    );
    return 1;
  }
  console.log("READY になりました");
  return 0;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    console.error(err instanceof VercelError ? err.message : err);
    process.exitCode = 1;
  });
