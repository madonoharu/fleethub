# fleethub-core

艦隊・装備・戦闘分析のロジックを実装する Rust ライブラリです。Next.js アプリと管理スクリプトは、このワークスペースの WebAssembly パッケージを使用します。

mise を用意してから、リポジトリルートで実行します。`mise.toml` と `mise.lock` が Bun 1.4.2、Rust 1.99.0、wasm-pack 0.15.0 を指定します。`mise exec --` は shell の activation なしで使えます。

```sh
mise trust
mise install --locked bun rust github:wasm-bindgen/wasm-pack
mise exec -- bun install --frozen-lockfile
mise exec -- bun run build:core
```

Rust のバージョン、rustfmt、clippy と Wasm ターゲットは `mise.toml` で管理します。Cargo・editor 向けの `rust-toolchain.toml` も同じ設定を保持するため、Rust 更新時には両方を揃えてください。ビルドスクリプトはブラウザー向けの `pkg/` と Node.js / Bun 向けの `node/` を生成し、TypeScript 型定義を整形します。生成物は Git にコミットしません。

```sh
mise exec -- cargo test --workspace --all-targets --locked
```

テストビルドでは最新のマスターデータを取得するためネットワーク接続が必要です。ネイティブテストの装備ボーナス計算も Bun で実行します。Rust を変更したら Wasm を再ビルドし、Next.js 開発サーバーを再起動してください。
