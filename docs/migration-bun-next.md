# Bun と Next.js の移行計画と実施結果

2026年10月2日時点の npm レジストリの安定版を基準に、Yarn 4、Next.js 15、React 18 のワークスペースを Bun と Next.js の現行版へ移行した。lint は Oxlint、型チェックは TypeScript、ユニット・DOM テストは Bun test、DOM は Happy DOM、ブラウザテストは Playwright を使用する。

## 計画と実装

1. 移行用・UI・ツール整備・検証用の worktree を用意し、既存テストを移行前の基準として実行した。
2. Yarn の設定とロックファイルを Bun に置き換え、`bun.lock` と `packageManager` でバージョンを固定した。インストールと Wasm ビルドを分離し、`setup` を依存順に実行する。
3. npm の直接依存を最新安定版へ更新した。暗黙の推移依存を明示し、未使用の ESLint・SWC CLI・tsx・Next.js 旧プラグインを削除した。
4. React、MUI、Tree View、Recharts、next-i18next、Ky、Firebase Admin の API 変更に対応した。MUI の system props は `sx`、入力設定は `slotProps` に移した。
5. CI と開発手順を更新した。frozen install、Rust、Oxlint、型チェック、Bun test、本番ビルド、配布成果物の検証、Chromium の E2E を実行する。
6. クリーンな worktree、本番 Chromium、配布ファイルだけを使う ISR の検証と、Astra xhigh の独立レビューで変更を確認した。
7. ユニットとブラウザのテスト用 worktree を分け、回帰テストを並列に追加した。既存テストは明示的な `bun:test` import に移し、Jest 本体・型・設定を削除した。モジュールモックを使うため、テストファイルごとの隔離を必須にした。
8. 開発ツール、Git hooks、Playwright の実行も Bun に統一した。ルートの `bunfig.toml` で `[run] bun = true` を指定し、Node.js のバージョン指定と Volta の設定、CI の setup-node を削除した。Playwright の設定は `.mts`、テストは専用ディレクトリの ESM 設定を使用する。
9. Bun、Rust、wasm-pack のバージョンを `mise.toml` にまとめた。Rust の components と Wasm target も mise でインストールし、wasm-pack は公式 GitHub リリースのバイナリを使用する。CI と API workflow は `jdx/mise-action@v5` で同じ設定を読み、wasm-pack の重複インストールを削除した。
10. バックエンドと UI の worktree を分け、Lodash の全10 import を es-toolkit に置き換えた。翻訳・マスターデータのマージを純粋な関数へ分離し、共有の配列ヘルパーも整理した。回帰テスト30件を追加し、未使用になった直接依存を削除した。

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
| Happy DOM         | 20.14.5        |
| Playwright        | 1.63.0         |
| es-toolkit        | 1.52.0         |

その他の直接依存も固定バージョンで更新し、解決結果を `bun.lock` に記録した。es-toolkit への置換後、6 manifest の npm 直接依存96宣言・88種類を2026年10月2日の公式レジストリと照合し、すべて latest と一致した。非推奨の直接依存は0件だった。Rust の直接依存32種類も最新安定版だった。Rust 1.99.0、Bun 1.4.2、wasm-pack 0.15.0 と CI Actions の採用 major は最新安定版を使用している。

許容範囲内で更新できる推移依存9種類もロックファイルで更新した。D3 の型6種類、`d3-array`、`d3-format`、`google-logging-utils` が対象で、依存元がバージョンを固定する既存の解決結果は維持した。更新後の frozen install は成功した。

## 実行と配布の方針

Pages Router を継続し、翻訳の事前生成、ISR、Emotion の Document 処理、状態永続化を維持する。next-i18next の Pages 用 import は `next-i18next/pages` を使用する。

Next.js は `bun --bun next` で実行する。Wasm の async WebAssembly を扱うため、開発・本番とも Webpack を明示する。Next.js 16 は標準で Turbopack を使うため、`--webpack` の指定が必要になる。[Next.js の移行ガイド](https://nextjs.org/docs/app/guides/upgrading/version-16)、[Bun の Next.js ガイド](https://bun.sh/guides/ecosystem/nextjs)

`bun run` が呼ぶ CLI は `[run] bun = true` により Bun で起動する。Git hooks の CLI には `bun --bun` を明示し、CI でも `bun run` を使用する。直接 `bunx` を使う場合は `--bun` を指定する。GitHub Actions 自体の JavaScript 実行環境はホスト runner が用意する。

ツールは `mise.toml` に固定する。Rust は minimal profile と rustfmt、clippy、`wasm32-unknown-unknown` を指定する。Cargo・editor 向けの `rust-toolchain.toml` は同じ設定を保持し、Rust 更新時には両方を揃える。Bun の `packageManager` も mise のバージョンに揃える。wasm-pack は registry shorthand がないため、公式バイナリを取得する `github:wasm-bindgen/wasm-pack` を明示する。[mise の Rust 設定](https://mise.jdx.dev/lang/rust.html)、[GitHub backend](https://mise.jdx.dev/dev-tools/backends/github.html)

`mise.lock` はツールのバージョン、バイナリの取得先と checksum を固定する。CI の mise-action はこのファイルを検出して `mise install --locked` を実行する。ツール更新時は設定と `mise lock` の結果を一緒にコミットする。

サーバーでは `fleethub-core` をバンドルせず、Node.js と互換性のある CommonJS ラッパーと隣接する Wasm を Bun から読む。配布パッケージにはこのラッパーと Wasm を維持し、Node.js を使うパッケージ利用者との互換性を継続する。クライアントは bundler 用 Wasm を使用する。管理用パッケージには storage の専用 export を追加し、ページが不要な管理 API を読み込まないようにした。管理スクリプトの `@fh/admin/src` も維持している。

Wasm の npm 依存は `raw_module` で直接参照し、依存管理は Bun に任せる。これにより、共有 Cargo キャッシュに別 worktree の package.json パスが残る問題を防ぎ、ビルド時の元の package.json の書き換えも不要になった。

ISR の配布成果物には全言語の翻訳 JSON と `next-i18next.config.js` を明示的に同梱する。`verify:build` は Next.js の trace に含まれるファイルだけを一時ディレクトリへコピーし、Wasm 初期化と5言語の `getStaticProps` を実行する。元のワークスペースからのモジュール読み込みを検出し、翻訳・設定ファイルの欠落を CI で防ぐ。

## 初回の依存関係・Next.js 移行時の検証

- 移行前の Jest は18スイート・157件が成功した。
- 生成物のない worktree で frozen install、Wasm を含む setup、Oxlint、TypeScript、Jest を順番に実行し、すべて成功した。`.next` がない状態の型チェックも成功した。
- 初回移行後の Jest は19スイート・162件が成功した。この既存ケースを維持して Bun test に移した。生成済みテストを対象から除外し、重複実行を防いだ。
- Rust は72件成功・1件 ignore。ベンチマークのテスト実行も成功した。
- 本番ビルドは成功し、Bun の本番サーバーで5言語・実データ・クライアント Wasm・フォルダと編成の作成／名前変更／ツリー操作・数値入力・再読み込み後の永続化を確認した。未処理のブラウザエラーは0件。
- 独立レビューではサーバーの Wasm パスと ISR の翻訳設定欠落を検出し、修正した。配布ファイルだけの隔離環境で全6翻訳 namespace と5言語の再生成を確認した。
- 元の develop で本番ビルド、`verify:build`、Oxlint、型チェック、Jest、Rust を最終実行し、すべて成功した。`verify:build` は6ページの trace から2511パスを隔離して確認した。
- 最終コードの別 worktree でも frozen install と共有 Cargo キャッシュからの setup が成功した。Bun の開発サーバーで5言語、開発用実データ、Wasm、入力とツリー操作、保存復元を確認し、未処理のブラウザエラーは0件。検証用サーバーは停止済み。

## Bun test と自動回帰テストへの移行

Jest 本体・環境パッケージ・型定義・設定を削除し、24ファイルの既存テストと追加テストを `bun:test` に移した。Bun のモジュールモックは `mock.restore()` だけでは元に戻らないため、通常のテストは `--isolate --parallel=2` で実行する。Happy DOM を preload で登録してから Testing Library と DOM matcher を読み込み、明示的な cleanup と時計・spy の復元を行う。DOM matcher のライブラリは `@testing-library/jest-dom/matchers` を利用し、Jest の実行系は使用しない。ブラウザの解析通信はユニットテストで SDK 境界を差し替える。

- Bun test は183件・24ファイルが成功した。既存162件に管理 API・ストレージ・状態の回帰18件と、編成の配置3件を追加した。
- seed 1472 のランダム実行でも183件が成功した。React StrictMode の数値入力、長押し・確定・値の制限・空入力の復元を維持した。
- 開発サーバーの Playwright 9件が成功した。5言語の初回 SSR・Wasm とメニュー切り替え、実際の艦選択と Rust の索敵計算、上下限、ツリーのキーボード操作、IndexedDB 保存後の再読み込みを検証する。
- ブラウザテストが、フォルダを選んで作成した編成がルートへ入る不具合を検出した。`createPlan` の保存先を reducer が挿入処理へ渡すように修正し、フォルダ内・同じ親の編成の直後・ルートへの追加を回帰テストで確認した。
- 本番ビルドと本番サーバーの Playwright 9件も成功した。ブラウザ例外・コンソールエラー・予期しない外部通信は0件で、検証用サーバーは停止した。
- ビルド成果物の Bun test は18件が成功した。コピーする trace の合成12件、実際の5言語再生成1件と、設定・翻訳・Wasm をコピー側から除いた3つの失敗検証、実際の Cargo Wasm metadata と過去のパス依存を再現する対照2件を含む。`verify:build` も6 manifest・2511パスの隔離環境で成功した。
- Astra xhigh の独立実行でも183件の通常・ランダム実行と、最新のビルド成果物18件がすべて成功した。
- Oxlint の型を使った解析、TypeScript、frozen install は成功した。CI に Bun test、ビルド成果物テスト、Chromium の本番 E2E を組み込んだ。

## 開発ツールの Bun 統一時の検証

Playwright 1.63.0 は CommonJS として TypeScript のテストを読み込む際、Bun 上では JavaScript の loader を割り当てていた。テストディレクトリを ESM にし、fixture のパス解決に `import.meta.dirname` を使用して、Bun が TypeScript を直接読み込むようにした。ルート設定も `playwright.config.mts` として ESM に揃えた。

- Node.js の呼び出しを失敗させる PATH で `bun run test:e2e --list` を実行し、9件を収集した。
- 元の develop でも mise のツールインストール、frozen install、実際の Git hook、Rust テスト72件とベンチマーク、本番ビルドが成功した。Oxlint、型チェック、ユニット183件、配布検証の6 manifest・2511パス、ビルド成果物18件も成功した。
- Node.js の呼び出しを失敗させ、既存の Bun を PATH に含めない環境で、`mise exec -- bun run test:e2e` の本番9件と `mise exec -- bun run test:e2e:dev` の開発9件が成功した。preload の記録で、Playwright 本体、test worker、Next.js 本体と子プロセス、開発時の型設定確認が、すべて mise の Bun 1.4.2 であることを確認した。
- 追加の本番スモークでは、実際の艦娘と装備から敵艦へのダメージを Wasm で計算し、D3 を使う分布グラフの SVG geometry と軸の数値、装甲貫通なしの切り替えを確認した。
- 本番・開発のブラウザ例外・コンソールエラー・予期しない外部通信は0件で、検証用サーバーは停止済み。開発サーバーの色設定とページデータサイズに関する警告は残る。

## es-toolkit への置換と変換処理の整理

ルート、admin、site、utils に es-toolkit 1.52.0 を明示し、自前ソースの Lodash import 10か所をすべて置換した。ルート・admin・site の直接依存 `lodash` とルートの `@types/lodash` は削除した。Cloudinary 2.11.0 が要求する推移依存の `lodash` 4.18.1 と、他の外部 SDK が使用する `lodash.*` は維持し、alias や override で置換していない。

用途に合わせて native API と compat API を選んだ。

- `isEqual`、`xor`、`mergeWith`、`uniq`、`uniqBy`、`sumBy` は native API を使う。共有の `groupBy` は既存の公開型を維持する薄い wrapper にした。型ガードの `includes`、継承プロパティも扱う `pick`・`mapValues` は既存の仕様を維持する。
- 動的な dot・bracket・配列パスを使うスプレッドシートと UI の `get`・`set` は compat API を使う。スプレッドシートでは、文字どおりのドットを含む見出しを優先する既存の読み取りも維持する。
- ドラッグ位置の `throttle` は同期的に直前の計算結果を返す compat API を使う。native API は `void` を返すため、この表示処理には適さない。継続した操作時の更新と結果の保持をアプリケーションの回帰テストで確認する。

native `mergeWith` は source を1つ受け取るため、翻訳マージは2回に分けた。ネットワーク取得から独立した `mergeLocaleMessages` で、空文字・単一スペース・null の取得結果が既存の非空の訳を消さない処理と、ネスト・配列のマージ、入力を変更しない性質を維持する。UI の `mergeMasterData` も純粋な関数に分離し、ID に対応する変更だけを適用して null は既定値を残す。戦闘定義の読み取りは共通処理にまとめ、欠損値は null、0 と false は実際の値として扱う。

追加した回帰テスト30件は、翻訳のフォールバックと非破壊マージ、スプレッドシートの実際のパスと batch payload、カットイン・陣形・艦の定義変換、装備名の重複とグループ化、マスターデータ上書き、ドラッグ位置の更新、解析設定のネスト更新、孤立データの削除とプリセット参照装備の保持を検証する。

ダメージグラフの開発 E2E が、同じ状態から毎回新しい配列を返す `NodeList` の React-Redux selector 警告を検出した。`shallowEqual` で選択結果を比較するように修正し、同じ警告が再発するとブラウザテストを失敗させる検証を追加した。

- Node.js の呼び出しを失敗させる環境で、mise の Bun 1.4.2 による213件・32ファイル・675 assertions の通常実行と seed 1472 のランダム実行が成功した。
- Oxlint、TypeScript、本番ビルドが成功した。配布検証は6ページの manifest から2890パスを隔離し、5言語・6翻訳 namespace の再生成と Wasm の初期化に成功した。ビルド成果物テスト18件も成功した。
- 同じく Node.js の呼び出しを失敗させる環境で、修正後の本番・開発 Playwright が各10件成功した。実際の Rust 計算による通常・クリティカルのダメージ範囲と、装甲貫通なしのフィルター、有限の SVG geometry を含む D3 グラフを確認した。ブラウザ例外・コンソールエラー・予期しない外部通信・selector の不安定な結果に関する警告はすべて0件だった。Playwright、Next.js とその子プロセスは mise の Bun 1.4.2 で実行し、検証用サーバーは停止した。
- 本番 static JS の全16チャンク合計は、4,541,090 bytes から4,521,069 bytes へ減少した。`Bun.gzipSync(chunk, { level: 9 })` で圧縮した合計は1,082,634 bytes から1,074,267 bytes になった。この測定の対象は全チャンクであり、ページごとの初回ダウンロード量は測定していない。

## 再現用コマンド

mise を用意し、リポジトリルートから実行する。Bun 1.4.2、Rust 1.99.0 と wasm-pack 0.15.0 は `mise.toml` で指定する。Rust のネイティブテストも、装備ボーナスの JavaScript 計算に Bun を使用する。

```sh
mise trust
mise install --locked bun rust github:wasm-bindgen/wasm-pack
mise exec -- bun install --frozen-lockfile
mise exec -- bun run setup
mise exec -- bun run lint
mise exec -- bun run typecheck
mise exec -- bun run test
mise exec -- cargo test --workspace --all-targets --locked
mise exec -- bun run build
mise exec -- bun run verify:build
mise exec -- bun run test:build
mise exec -- bun run playwright install --with-deps chromium
mise exec -- bun run test:e2e
E2E_WORKERS=1 mise exec -- bun run test:e2e:dev
mise exec -- bun run dev
```

`build` は setup を含む。`lint`、型チェック、ユニットテストの前には setup が必要。Wasm 最適化、型チェック、DOM テスト、Next.js 開発サーバーはメモリを多く使うため、メモリが限られる環境では同時実行を避ける。ブラウザの workers は `E2E_WORKERS` で調整できる。

ビルドと配布成果物検証は公開 GCS データを読み取るため、ネットワーク接続が必要。ブラウザ確認は公開バケットの CORS が許可する `http://localhost:3000` で行う。配布成果物検証は実際の再生成関数を確認し、ホスティングサービスの HTTP キャッシュ機構は検証しない。デプロイと外部データの更新はこの移行に含めない。
