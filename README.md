# fleethub

[![GitHub deployments](https://img.shields.io/github/deployments/madonoharu/fleethub/production?label=vercel&logo=Vercel&logoColor=white)](https://jervis.vercel.app)
[![npm](https://img.shields.io/npm/v/fleethub-core)](https://www.npmjs.com/package/fleethub-core)

データはスプレッドシートから編集できます。  
[作戦室データ管理シート](https://docs.google.com/spreadsheets/d/1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA)

## Developing

JavaScript の実行と依存関係の管理には [Bun](https://bun.com/docs/installation) を使用します。必要なバージョンはルートの `package.json` の `packageManager` に固定し、`bun.lock` をコミットします。Next.js、Playwright、開発ツール、Git hooks も Bun で実行します。

リポジトリを clone し、作業用の branch を作成したら、ルートディレクトリで依存関係をインストールします。

```sh
bun install --frozen-lockfile
```

インストールでは Husky の Git hooks を設定します。Wasm やワークスペースのビルドは、次の `setup` で明示的に実行します。

ビルドの前に [Rustup](https://www.rust-lang.org/tools/install)、[wasm-pack](https://github.com/wasm-bindgen/wasm-pack) 0.15.0 を用意してください。Rust は `rust-toolchain.toml` で 1.99.0 に固定しており、Rustup が必要なコンポーネントと `wasm32-unknown-unknown` ターゲットをインストールします。

```sh
cargo install wasm-pack --version 0.15.0 --locked
bun run setup
bun run dev
```

[http://localhost:3000](http://localhost:3000) を開くとアプリを確認できます。`setup` は Wasm、共有ユーティリティ、艦これ API 型定義、管理用パッケージを依存関係の順にビルドします。

| コマンド                                        | 内容                                                |
| ----------------------------------------------- | --------------------------------------------------- |
| `bun run dev`                                   | Next.js 開発サーバーを起動                          |
| `bun run build`                                 | ワークスペースを準備して Next.js の本番ビルドを生成 |
| `bun run start`                                 | 本番ビルドを起動                                    |
| `bun run lint`                                  | Oxlint で静的解析                                   |
| `bun run typecheck`                             | TypeScript の型チェック                             |
| `bun run test`                                  | Bun test でユニット・DOM テストを隔離して並列実行   |
| `bun run test:build`                            | ビルド成果物・Wasm・翻訳の同梱と欠落時の失敗を検証  |
| `bun run test:e2e`                              | 本番ビルドを Chromium で検証                        |
| `bun run test:e2e:dev`                          | 開発サーバーを Chromium で検証                      |
| `cargo test --workspace --all-targets --locked` | Rust ワークスペースのテストを実行                   |
| `bun run build:core`                            | Wasm と TypeScript 型定義を再生成                   |

型チェックやテストの前には `bun run setup` を実行してください。Rust を変更した場合は `bun run build:core` で Wasm を再生成してから開発サーバーを再起動します。Rust のテストビルドでは最新のマスターデータを取得するためネットワーク接続が必要です。

Next.js は既存の Pages Router を使用し、Wasm のバンドルに対応する Webpack でビルドします。

ルートの `bunfig.toml` の `[run] bun = true` により、`bun run` で呼ぶ JavaScript CLI も Bun で起動します。直接 `bunx` を使う場合は `bunx --bun` を指定してください。配布する `fleethub-core` の Node.js 向け CommonJS ラッパーと Wasm は維持しており、パッケージ利用者の Node.js 互換性は継続します。

テストランナーは Bun test を使用し、DOM は Happy DOM、操作と検証は Testing Library を使用します。`bun run test` は `bun test --isolate --parallel=2 ./packages` を実行します。ブラウザ・ビルド成果物のテストと生成済みファイルは通常のユニットテストから除外します。

ブラウザテストの初回は `bun run playwright install --with-deps chromium` を実行してください。本番テストの前には `bun run build` が必要です。ブラウザのデータは公開データの固定 fixture を使用します。詳しい実行手順は [tests/e2e/README.md](tests/e2e/README.md) を参照してください。メモリが少ない環境では `E2E_WORKERS=1 bun run test:e2e:dev` で実行できます。

## CI とホスティング

CI は `bun install --frozen-lockfile` と `bun run setup` を分けて実行し、Rust テスト、Oxlint、型チェック、Bun test、本番ビルド、配布成果物テスト、Chromium での E2E を確認します。データ更新用の API workflow もワークスペースをビルドしてから更新スクリプトを実行します。

ホスティング環境ではリポジトリルートで依存関係をインストールし、`packages/site` を Next.js アプリとして使用してください。アプリの `build` スクリプトがワークスペースを準備するため、ビルド環境にも Rustup と wasm-pack が必要です。依存関係を変更した場合は `bun install` で `bun.lock` を更新し、変更した `package.json` と一緒にコミットしてください。
