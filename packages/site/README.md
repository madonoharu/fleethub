# @fh/site

艦隊編成・戦闘分析を行う Next.js アプリです。Pages Router、React、MUI とワークスペース内の `fleethub-core` Wasm を使用します。

開発はリポジトリルートから開始します。mise による Bun、Rust、wasm-pack の準備については [ルートの README](../../README.md) を参照してください。

```sh
mise trust
mise install --locked bun rust github:wasm-bindgen/wasm-pack
mise exec -- bun install --frozen-lockfile
mise exec -- bun run setup
mise exec -- bun run dev
```

開発サーバーは [http://localhost:3000](http://localhost:3000) で起動します。画面は `src/pages`、共通 UI は `src/components`、翻訳は `public/locales` にあります。

```sh
mise exec -- bun run build
mise exec -- bun run start
```

Next.js は Bun のランタイムで実行し、Wasm を扱うため Webpack を使用します。`packages/site` 内で `bun run build` を実行した場合も、ルートの `setup` で必要なワークスペースをビルドします。

ホスティングではリポジトリルートで `mise install --locked bun rust github:wasm-bindgen/wasm-pack` と `mise exec -- bun install --frozen-lockfile`、アプリのビルドは `packages/site` で `mise exec -- bun run build` を実行してください。ビルドに必要な Rust と wasm-pack もルートの `mise.toml` と `mise.lock` で管理します。
