# fleethub

[![GitHub deployments](https://img.shields.io/github/deployments/madonoharu/fleethub/production?label=vercel&logo=Vercel&logoColor=white)](https://jervis.vercel.app)
[![npm](https://img.shields.io/npm/v/fleethub-core)](https://www.npmjs.com/package/fleethub-core)

データはスプレッドシートから編集できます。  
[作戦室データ管理シート](https://docs.google.com/spreadsheets/d/1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA)

## Developing

サイトと管理スクリプトの開発には Bun 1.4.2 を使用します。`fleethub-core` は npm に公開済みの Wasm パッケージを使用するため、サイトの開発・ビルドに Rust と wasm-pack は不要です。Next.js、Playwright、開発ツールも Bun で実行し、`packageManager` と `bun.lock` をコミットします。

利用側の `fleethub-core` と `equipment-bonus` の依存指定は `latest` とします。`fleethub-core@1.12.21` から `equipment-bonus` を peer 依存として宣言し、利用側と共有するため、ルートの `overrides` は不要です。実際に使うバージョンは `bun.lock` に記録し、開発・CI・ホスティングでは `bun install --frozen-lockfile` で再現します。

最新の公開版を採用する際は、ルートで `bun update equipment-bonus fleethub-core` を実行し、計算・ビルドの検証後に `bun.lock` をコミットしてください。このコマンドは `latest` の宣言を維持して解決結果を更新します。[Bun の更新コマンド](https://bun.sh/docs/pm/cli/update)

[mise](https://mise.jdx.dev/installing-mise.html) で Bun を管理する場合は、リポジトリルートで Bun だけをインストールします。`mise.toml` と `mise.lock` にバージョン、取得先、checksum を記録しています。

```sh
mise trust
mise install --locked bun
```

mise の shell activation などで Bun 1.4.2 を PATH に用意してから、次を実行します。Bun を直接インストールした環境でも同じコマンドを使えます。

```sh
bun install --frozen-lockfile
bun run setup
bun run dev
```

[http://localhost:3000](http://localhost:3000) を開くとアプリを確認できます。`setup` は共有ユーティリティ、艦これ API 型定義、管理用パッケージを依存関係の順にビルドします。Wasm のコンパイルは行いません。

| コマンド                                        | 内容                                                |
| ----------------------------------------------- | --------------------------------------------------- |
| `bun run dev`                                   | Next.js 開発サーバーを起動                          |
| `bun run build`                                 | ワークスペースを準備して Next.js の本番ビルドを生成 |
| `bun run start`                                 | 本番ビルドを起動                                    |
| `bun run format`                                | Oxfmt で整形                                        |
| `bun run format:check`                          | Oxfmt で整形差分を確認                              |
| `bun run lint`                                  | Oxlint で静的解析                                   |
| `bun run typecheck`                             | TypeScript の型チェック                             |
| `bun run test`                                  | Bun test でユニット・DOM テストを隔離して並列実行   |
| `bun run test:build`                            | ビルド成果物・Wasm・翻訳の同梱と欠落時の失敗を検証  |
| `bun run test:e2e`                              | 本番ビルドを Chromium で検証                        |
| `bun run test:e2e:dev`                          | 開発サーバーを Chromium で検証                      |
| `cargo test --workspace --all-targets --locked` | Rust ワークスペースのテストを実行                   |
| `bun run build:core`                            | Wasm と TypeScript 型定義を再生成                   |
| `bun run test:core`                             | ローカル生成 Wasm のビルドメタデータを検証          |

型チェックやアプリのテストの前には `bun run setup` を実行してください。Rust のコマンドと `build:core`、`test:core` は、下記のコア開発用ツールを準備した環境で実行します。

整形には Oxfmt 0.71.0 を使用します。`bun run format` で整形し、`bun run format:check` で変更なしに確認できます。行幅と `package.json` のキー順は Oxfmt のデフォルト設定を使用します。除外パターンは `.oxfmtrc.json` の `ignorePatterns` で管理します。整形は手動で実行し、CI でも確認します。[Oxfmt の移行ガイド](https://oxc.rs/docs/guide/usage/formatter/migrate-from-prettier.html)

Next.js は既存の Pages Router を使用し、本番ビルドは Turbopack で npm パッケージの Wasm をバンドルします。Bun の dev では Turbopack が起動後に作る外部依存のリンクを解決できない問題が再現するため、開発時のみ Webpack を使用します。

ルートの `bunfig.toml` の `[run] bun = true` により、`bun run` で呼ぶ JavaScript CLI も Bun で起動します。直接 `bunx` を使う場合は `bunx --bun` を指定してください。配布する `fleethub-core` の Node.js 向け CommonJS ラッパーと Wasm は維持しており、パッケージ利用者の Node.js 互換性は継続します。

テストランナーは Bun test を使用し、DOM は Happy DOM、操作と検証は Testing Library を使用します。`bun run test` は `bun test --isolate --parallel=2 ./packages` を実行します。ブラウザ・ビルド成果物のテストと生成済みファイルは通常のユニットテストから除外します。

ブラウザテストの初回は `bun run playwright install --with-deps chromium` を実行してください。本番テストの前には `bun run build` が必要です。ブラウザのデータは公開データの固定 fixture を使用します。詳しい実行手順は [tests/e2e/README.md](tests/e2e/README.md) を参照してください。メモリが少ない環境では `E2E_WORKERS=1 bun run test:e2e:dev` で実行できます。

## CI とホスティング

CI のアプリ検証 job とデータ更新用 API workflow は Bun のみをインストールします。`bun install --frozen-lockfile` と `bun run setup` を分けて実行し、アプリ検証では Oxfmt の `format:check`、Oxlint、型チェック、Bun test、本番ビルド、配布成果物テスト、Chromium の E2E を確認します。Rust の検証は別 job に分け、Bun、Rust、wasm-pack を準備して `cargo test`、`bun run build:core`、`bun run test:core` を実行します。共通 action は `jdx/mise-action@v5` の `install_args` で必要なツールだけを `--locked` でインストールします。

ホスティングも npm 配布済み Wasm を利用します。Bun を用意して `bun install --frozen-lockfile`、`bun run build` を実行すれば、Rust と wasm-pack のインストールやコンパイルは不要です。Vercel は `packages/site` を Root Directory とし、[packages/site/vercel.json](packages/site/vercel.json) のインストール・ビルド設定を使用します。依存関係を変更した場合は `bun install` で `bun.lock` を更新し、変更した `package.json` と一緒にコミットします。

## Rust コアの開発・公開

コアを変更する場合は、mise で Rust 1.99.0 と wasm-pack 0.15.0 も準備します。

```sh
mise install --locked bun rust github:wasm-bindgen/wasm-pack
mise exec -- cargo test --workspace --all-targets --locked
mise exec -- bun run build:core
mise exec -- bun run test:core
```

mise は Rustup を通じて Rust、rustfmt、clippy と `wasm32-unknown-unknown` ターゲットをインストールします。wasm-pack は公式 GitHub リリースのバイナリを使用します。Cargo と editor が参照する `rust-toolchain.toml` は `mise.toml` と同じ設定を保持するため、Rust 更新時には両方を揃えてください。Bun 更新時は `packageManager` も揃え、ツール更新後は `mise lock` で `mise.lock` を更新します。

`build:core` は `crates/fleethub-core` に公開用の `pkg/` と `node/` を生成します。サイトの npm 依存はこのローカル生成物へ自動で切り替わりません。新しいコアをサイトへ反映する際は、上記の更新コマンドで npm 公開版を解決し、`bun.lock` を更新してください。コアの公開前にも `build:core` と `test:core` を実行します。Rust のテストビルドは最新のマスターデータを取得するためネットワーク接続が必要です。詳細は [コアの README](crates/fleethub-core/README.md) を参照してください。
