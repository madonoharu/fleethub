# fleethub-core

艦隊・装備・戦闘分析のロジックを実装する Rust ライブラリです。Next.js アプリと管理スクリプトは npm 公開版の WebAssembly パッケージを使用します。このディレクトリは Cargo ワークスペースに残し、コアの開発・公開時に明示的にビルドします。

mise を用意してから、リポジトリルートで実行します。`mise.toml` と `mise.lock` が Bun 1.4.2、Rust 1.99.0、wasm-pack 0.15.0 を指定します。`mise exec --` は shell の activation なしで使えます。

```sh
mise trust
mise install --locked bun rust github:wasm-bindgen/wasm-pack
mise exec -- bun install --frozen-lockfile
mise exec -- bun run build:core
mise exec -- bun run test:core
```

Rust のバージョン、rustfmt、clippy と Wasm ターゲットは `mise.toml` で管理します。Cargo・editor 向けの `rust-toolchain.toml` も同じ設定を保持するため、Rust 更新時には両方を揃えてください。ビルドスクリプトはブラウザー向けの `pkg/` と Node.js / Bun 向けの `node/` を生成し、TypeScript 型定義を整形します。生成物は Git にコミットしません。

```sh
mise exec -- cargo fmt --all -- --check
mise exec -- cargo clippy --workspace --all-targets --locked -- -D warnings
mise exec -- cargo test --workspace --all-targets --locked
```

Rust 1.99 / edition 2024 を前提に、遅延初期化は標準の `LazyLock`、早期終了は `let-else` を使用します。JavaScript との変換は Tsify、結果のシリアライズは serde_with、エラー表示は thiserror に集約しています。Bun を使うネイティブ計算が失敗した場合は、Rust 1.99 の `String::from_utf8_lossy_owned` で標準エラーを表示します。

テストビルドでは最新のマスターデータを取得するためネットワーク接続が必要です。ネイティブテストの装備ボーナス計算も Bun で実行します。

`equipment-bonus` は `peerDependencies` に `^7.13.26` として宣言し、利用側と同じパッケージを使用します。利用側では `fleethub-core` と `equipment-bonus` を直接依存として追加します。このリポジトリでは両方を `latest` で指定し、実際の解決バージョンを `bun.lock` に記録します。コアの開発・ネイティブテストでは、ルートの `devDependencies` にある `equipment-bonus` を使用します。

公開前には `build:core` と `test:core` を実行し、生成済みの `pkg/` と `node/` を npm パッケージへ含めてください。ローカルで Wasm を再ビルドしても、サイトが参照する npm 依存は置き換わりません。新しい公開版をサイトで使う場合は、ルートで `bun update equipment-bonus fleethub-core` を実行し、検証後に `bun.lock` をコミットしてください。

`fleethub-core@1.12.21` から `equipment-bonus` は peer 依存です。旧版の固定依存を置き換えるための override は不要になります。更新時には配布パッケージのテストで、peer のバージョン範囲を満たし、アプリとコアが同じ `equipment-bonus` を解決することを確認してください。
