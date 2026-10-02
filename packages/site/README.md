# @fh/site

艦隊編成・戦闘分析を行う Next.js アプリです。Pages Router、React、MUI とワークスペース内の `fleethub-core` Wasm を使用します。

開発はリポジトリルートから開始します。Bun、Node.js 24 LTS、Rustup、wasm-pack、`jq` の準備については [ルートの README](../../README.md) を参照してください。

```sh
bun install --frozen-lockfile
bun run setup
bun run dev
```

開発サーバーは [http://localhost:3000](http://localhost:3000) で起動します。画面は `src/pages`、共通 UI は `src/components`、翻訳は `public/locales` にあります。

```sh
bun run build
bun run start
```

Next.js は Bun のランタイムで実行し、Wasm を扱うため Webpack を使用します。`packages/site` 内で `bun run build` を実行した場合も、ルートの `setup` で必要なワークスペースをビルドします。

ホスティングのインストールはリポジトリルートで `bun install --frozen-lockfile`、アプリのビルドは `packages/site` で `bun run build` を実行してください。ビルドには Rustup、wasm-pack、`jq` が必要です。
