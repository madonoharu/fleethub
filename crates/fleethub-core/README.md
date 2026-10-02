# fleethub-core

艦隊・装備・戦闘分析のロジックを実装する Rust ライブラリです。Next.js アプリと管理スクリプトは、このワークスペースの WebAssembly パッケージを使用します。

Rustup、wasm-pack 0.15.0、Bun を用意してから、リポジトリルートで実行します。

```sh
bun install --frozen-lockfile
bun run build:core
```

Rust のバージョンと Wasm ターゲットは `rust-toolchain.toml` で管理します。ビルドスクリプトはブラウザー向けの `pkg/` と Node.js / Bun 向けの `node/` を生成し、TypeScript 型定義を整形します。生成物は Git にコミットしません。

```sh
cargo test --workspace --all-targets --locked
```

テストビルドでは最新のマスターデータを取得するためネットワーク接続が必要です。Rust を変更したら Wasm を再ビルドし、Next.js 開発サーバーを再起動してください。
