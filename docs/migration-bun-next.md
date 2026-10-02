# Bun と Next.js の移行計画と実施結果

2026年10月2日時点の npm レジストリの安定版を基準に、Yarn 4、Next.js 15、React 18 のワークスペースを Bun と Next.js の現行版へ移行した。lint は Oxlint、型チェックは TypeScript、DOM テストは Node.js 上の Jest を使用する。

## 計画と実装

1. 移行用・UI・ツール整備・検証用の worktree を用意し、既存テストを移行前の基準として実行した。
2. Yarn の設定とロックファイルを Bun に置き換え、`bun.lock` と `packageManager` でバージョンを固定した。インストールと Wasm ビルドを分離し、`setup` を依存順に実行する。
3. npm の直接依存を最新安定版へ更新した。暗黙の推移依存を明示し、未使用の ESLint・SWC CLI・tsx・Next.js 旧プラグインを削除した。
4. React、MUI、Tree View、Recharts、next-i18next、Ky、Firebase Admin の API 変更に対応した。MUI の system props は `sx`、入力設定は `slotProps` に移した。
5. CI と開発手順を更新した。frozen install、Rust、Oxlint、型チェック、Jest、本番ビルド、配布成果物の検証を実行する。
6. クリーンな worktree、本番 Chromium、配布ファイルだけを使う ISR の検証と、Astra xhigh の独立レビューで変更を確認した。

| 対象              | 採用バージョン |
| ----------------- | -------------- |
| Bun               | 1.4.2          |
| Next.js           | 16.3.8         |
| React / React DOM | 19.3.0         |
| TypeScript        | 7.0.2          |
| Oxlint            | 1.86.0         |
| MUI / Tree View   | 9.4.0 / 9.14.0 |
| Recharts          | 3.10.1         |
| next-i18next      | 16.3.1         |
| Jest              | 30.5.2         |

その他の直接依存も固定バージョンで更新し、解決結果を `bun.lock` に記録した。最終監査で6 manifestの直接依存96件・89種類すべてが公式 npm レジストリの latest と一致した。Rust は既存の 1.99.0 と Cargo.lock を維持した。Node.js 24 LTS を開発ツールと CI に使用し、Volta のリポジトリ設定では24.14.0を指定した。

## 実行と配布の方針

Pages Router を継続し、翻訳の事前生成、ISR、Emotion の Document 処理、状態永続化を維持する。next-i18next の Pages 用 import は `next-i18next/pages` を使用する。

Next.js は `bun --bun next` で実行する。Wasm の async WebAssembly を扱うため、開発・本番とも Webpack を明示する。Next.js 16 は標準で Turbopack を使うため、`--webpack` の指定が必要になる。[Next.js の移行ガイド](https://nextjs.org/docs/app/guides/upgrading/version-16)、[Bun の Next.js ガイド](https://bun.sh/guides/ecosystem/nextjs)

サーバーでは `fleethub-core` をバンドルせず、Node 用ラッパーと隣接する Wasm をパッケージから読む。クライアントは bundler 用 Wasm を使用する。管理用パッケージには storage の専用 export を追加し、ページが不要な管理 API を読み込まないようにした。管理スクリプトの `@fh/admin/src` も維持している。

Wasm の npm 依存は `raw_module` で直接参照し、依存管理は Bun に任せる。これにより、共有 Cargo キャッシュに別 worktree の package.json パスが残る問題を防ぎ、ビルド時の元の package.json の書き換えも不要になった。

ISR の配布成果物には全言語の翻訳 JSON と `next-i18next.config.js` を明示的に同梱する。`verify:build` は Next.js の trace に含まれるファイルだけを一時ディレクトリへコピーし、Wasm 初期化と5言語の `getStaticProps` を実行する。元のワークスペースからのモジュール読み込みを検出し、翻訳・設定ファイルの欠落を CI で防ぐ。

## 検証

- 移行前の Jest は18スイート・157件が成功した。
- 生成物のない worktree で frozen install、Wasm を含む setup、Oxlint、TypeScript、Jest を順番に実行し、すべて成功した。`.next` がない状態の型チェックも成功した。
- 移行後の Jest は19スイート・162件が成功した。生成済みテストを対象から除外し、重複実行を防いだ。
- Rust は72件成功・1件 ignore。ベンチマークのテスト実行も成功した。
- 本番ビルドは成功し、Bun の本番サーバーで5言語・実データ・クライアント Wasm・フォルダと編成の作成／名前変更／ツリー操作・数値入力・再読み込み後の永続化を確認した。未処理のブラウザエラーは0件。
- 独立レビューではサーバーの Wasm パスと ISR の翻訳設定欠落を検出し、修正した。配布ファイルだけの隔離環境で全6翻訳 namespace と5言語の再生成を確認した。
- 元の develop で本番ビルド、`verify:build`、Oxlint、型チェック、Jest、Rust を最終実行し、すべて成功した。`verify:build` は6ページの trace から2511パスを隔離して確認した。
- 最終コードの別 worktree でも frozen install と共有 Cargo キャッシュからの setup が成功した。Bun の開発サーバーで5言語、開発用実データ、Wasm、入力とツリー操作、保存復元を確認し、未処理のブラウザエラーは0件。検証用サーバーは停止済み。

## 再現用コマンド

Bun 1.4.2、Node.js 24 LTS、Rustup、wasm-pack 0.15.0 を用意する。

```sh
bun install --frozen-lockfile
bun run setup
bun run lint
bun run typecheck
bun run test --ci --runInBand
cargo test --workspace --all-targets --locked
bun run build
bun run verify:build
bun run dev
```

`build` は setup を含む。`lint`、型チェック、Jest の前には setup が必要。Wasm 最適化と型チェックはメモリを多く使うため、メモリが限られる環境では同時実行を避ける。

ビルドと配布成果物検証は公開 GCS データを読み取るため、ネットワーク接続が必要。ブラウザ確認は公開バケットの CORS が許可する `http://localhost:3000` で行う。配布成果物検証は実際の再生成関数を確認し、ホスティングサービスの HTTP キャッシュ機構は検証しない。デプロイと外部データの更新はこの移行に含めない。
