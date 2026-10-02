# Bun と Next.js の移行計画と実施結果

2026年10月2日時点の npm レジストリの安定版を基準に、Yarn 4、Next.js 15、React 18 のワークスペースを Bun と Next.js の現行版へ移行した。整形は Oxfmt、lint は Oxlint、型チェックは TypeScript、ユニット・DOM テストは Bun test、DOM は Happy DOM、ブラウザテストは Playwright を使用する。

各段階の実装・検証件数は履歴として残す。現在の開発・配布手順は「現行の実行と配布の方針」と「現行の再現用コマンド」を参照する。初期検証に含まれる Wasm のローカルビルドや Webpack の設定は、その後の移行で変更している。

## 初期移行の計画と実装（履歴）

1. 移行用・UI・ツール整備・検証用の worktree を用意し、既存テストを移行前の基準として実行した。
2. Yarn の設定とロックファイルを Bun に置き換え、`bun.lock` と `packageManager` でバージョンを固定した。インストールと Wasm ビルドを分離し、`setup` を依存順に実行する。
3. npm の直接依存を最新安定版へ更新した。暗黙の推移依存を明示し、未使用の ESLint・SWC CLI・tsx・Next.js 旧プラグインを削除した。
4. React、MUI、Tree View、Recharts、next-i18next、Ky、Firebase Admin の API 変更に対応した。MUI の system props は `sx`、入力設定は `slotProps` に移した。
5. CI と開発手順を更新した。frozen install、Rust、Oxlint、型チェック、Bun test、本番ビルド、配布成果物の検証、Chromium の E2E を実行する。
6. クリーンな worktree、本番 Chromium、配布ファイルだけを使う ISR の検証と、Astra xhigh の独立レビューで変更を確認した。
7. ユニットとブラウザのテスト用 worktree を分け、回帰テストを並列に追加した。既存テストは明示的な `bun:test` import に移し、Jest 本体・型・設定を削除した。モジュールモックを使うため、テストファイルごとの隔離を必須にした。
8. 開発ツール、Playwright の実行も Bun に統一した。ルートの `bunfig.toml` で `[run] bun = true` を指定し、Node.js のバージョン指定と Volta の設定、CI の setup-node を削除した。Playwright の設定は `.mts`、テストは専用ディレクトリの ESM 設定を使用する。
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

## 現行の実行と配布の方針

Pages Router を継続し、翻訳の事前生成、ISR、状態永続化を維持する。next-i18next の Pages 用 import は `next-i18next/pages` を使用する。MUI の SSR は `@mui/material-nextjs/v16-pagesRouter` の `AppCacheProvider`、`documentGetInitialProps`、`DocumentHeadTags` に統一した。同じ設定の Emotion cache に `enableCssLayer: true` を指定し、MUI と Tailwind CSS 4 の優先順位を `theme, base, mui, components, utilities` に揃える。[MUI の Pages Router 連携](https://mui.com/material-ui/integrations/nextjs/#pages-router)

Next.js は Bun で実行し、本番は `bun --bun next build --turbopack`、開発は `bun --bun next dev --webpack` を使用する。本番の Turbopack では npm パッケージ内の Wasm を扱えることをビルド・ブラウザで確認した。[Turbopack の標準設定と Webpack の指定](https://nextjs.org/docs/app/api-reference/turbopack#getting-started)

開発時の Bun と Turbopack の組み合わせでは、動的に生成された外部依存のハッシュ付き alias を解決できず HTTP 500 になる問題が再現した。既存キャッシュの削除、独立した新規コピー、`bundlePagesRouterDependencies: true` のいずれでも解消しなかったため、開発時は Webpack を維持する。[同型の Bun issue](https://github.com/oven-sh/bun/issues/25370) があるが、この環境での内部原因は未確定であり、同一原因とは断定していない。

開発用の `webpack` hook は `asyncWebAssembly` とブラウザ出力の `asyncFunction` 設定だけを残した。従来のサーバー用 Wasm 出力修正プラグインと重複する `layers` 設定は削除した。本番ビルドは `--turbopack` を明示して、この開発用 hook から分離する。

バンドル分析は `@next/bundle-analyzer` から Next.js 組み込みの `experimental-analyze` に移した。`bun run --cwd packages/site analyze --output` は分析結果を `packages/site/.next/diagnostics/analyze` に保存する。分析は配布用ビルドを生成しないため、本番起動の前には別途 `bun run build` を実行する。[Next.js の分析コマンド](https://nextjs.org/docs/app/api-reference/cli/next#next-experimental-analyze-options)

サイト・管理スクリプトの開発とホスティングには Bun 1.4.2 だけを用意する。`fleethub-core` は npm 公開版を使用し、Rust crate を Bun workspaces から外した。`setup` は utils・kcs・admin を依存順にビルドし、Wasm をコンパイルしない。利用側の `fleethub-core` と `equipment-bonus` の依存指定は `latest` とする。npm 公開版 `fleethub-core@1.12.21` は `equipment-bonus` を `peerDependencies: ^7.13.26` として宣言し、利用側と共有する。旧版の固定依存を置き換える root の override は削除した。具体的な解決バージョンは `bun.lock` で固定し、開発・CI・ホスティングで frozen install を使う。公開版を更新する際は、ルートで `bun update equipment-bonus fleethub-core` を実行する。このコマンドは `latest` の宣言を維持してロックファイルを更新するため、計算・ビルドを検証してから `bun.lock` をコミットする。[Bun の更新コマンド](https://bun.sh/docs/pm/cli/update)

`bun run` が呼ぶ CLI は `[run] bun = true` により Bun で起動する。CI でも `bun run` を使用する。直接 `bunx` を使う場合は `--bun` を指定する。GitHub Actions 自体の JavaScript 実行環境はホスト runner が用意する。

整形は Oxfmt 0.71.0 に固定し、`bun run format` で書き込み、`bun run format:check` で整形差分を確認する。CI のアプリ検証 job も `format:check` を実行する。行幅と `package.json` のキー順は Oxfmt のデフォルトを使用し、旧 `.prettierignore` の除外設定を `.oxfmtrc.json` の `ignorePatterns` に移した。翻訳の更新と Wasm 型定義の生成後も `bun run format` で整形する。[Oxfmt の移行ガイド](https://oxc.rs/docs/guide/usage/formatter/migrate-from-prettier.html)

mise は開発環境の任意の管理手段とし、JS 開発では `mise install --locked bun` で Bun のみを導入できる。Rust コアの開発・公開時には Rust と wasm-pack も使用する。Rust は minimal profile と rustfmt、clippy、`wasm32-unknown-unknown` を指定する。Cargo・editor 向けの `rust-toolchain.toml` は `mise.toml` と同じ設定を保持し、Rust 更新時には両方を揃える。Bun の `packageManager` も mise のバージョンに揃える。wasm-pack は公式バイナリを取得する `github:wasm-bindgen/wasm-pack` を明示する。[mise の Rust 設定](https://mise.jdx.dev/lang/rust.html)、[GitHub backend](https://mise.jdx.dev/dev-tools/backends/github.html)

`mise.lock` はツールのバージョン、バイナリの取得先と checksum を固定する。CI のアプリ検証 job と API workflow は共通 action の `install_args: --locked bun` で Bun のみを導入する。Rust は別 job に分け、全ツールを導入して `cargo test`、`build:core`、`test:core` を実行する。ツール更新時は設定と `mise lock` の結果を一緒にコミットする。

Vercel の Root Directory は `packages/site` とし、`packages/site/vercel.json` の `bunVersion: "1.4.x"` を使用する。インストールとビルドのコマンドは `bunx bun@1.4.2` で固定版を起動する。ホスティング環境には Rust の導入・コンパイル処理を持ち込まない。[Vercel の Bun runtime](https://vercel.com/docs/functions/runtimes/bun)

サーバーでは `fleethub-core` をバンドルせず、Node.js と互換性のある CommonJS ラッパーと隣接する Wasm を Bun から読む。配布パッケージにはこのラッパーと Wasm を維持し、Node.js を使うパッケージ利用者との互換性を継続する。クライアントは bundler 用 Wasm を使用する。管理用パッケージには storage の専用 export を追加し、ページが不要な管理 API を読み込まないようにした。管理スクリプトの `@fh/admin/src` も維持している。

Rust コアをローカルでビルドする経路では、Wasm の npm 依存を `raw_module` で直接参照し、依存管理は Bun に任せる。これにより、共有 Cargo キャッシュに別 worktree の package.json パスが残る問題を防ぎ、ビルド時の元の package.json の書き換えも不要になった。この回帰検証は `tests/core` と `test:core` に分離した。ローカルの `build:core` はサイトの npm 依存を自動で差し替えない。公開版をサイトへ採用する際は、上記の更新コマンドで `latest` の解決結果を `bun.lock` に反映して検証する。

ISR の配布成果物には全言語の翻訳 JSON と `next-i18next.config.js` を明示的に同梱する。`verify:build` は Next.js の trace に含まれるファイルだけを一時ディレクトリへコピーし、Wasm 初期化と5言語の `getStaticProps` を実行する。元のワークスペースからのモジュール読み込みを検出し、翻訳・設定ファイルの欠落を CI で防ぐ。

## 現行設定への追加移行と検証状況

Rust ソースとローカル Wasm 生成物を含めない独立コピーで、npm 配布済み Wasm を使うインストール・setup・ビルド経路を確認した。直近のユニットテスト271件に加え、Bun と Turbopack による本番ビルドの配布成果物テスト20件、本番 E2E 17件が成功している。Bun と Webpack を維持した開発構成の E2E 17件も成功した。5言語の初回 HTML と hydration で MUI の style 配置・CSS layer 順も検証した。

未使用の KCS 用 `.swcrc` も削除した。

これらはローカルと隔離環境での検証であり、新しい本番デプロイは行っていない。

## 初回の依存関係・Next.js 移行時の検証（履歴）

- 移行前の Jest は18スイート・157件が成功した。
- 生成物のない worktree で frozen install、Wasm を含む setup、Oxlint、TypeScript、Jest を順番に実行し、すべて成功した。`.next` がない状態の型チェックも成功した。
- 初回移行後の Jest は19スイート・162件が成功した。この既存ケースを維持して Bun test に移した。生成済みテストを対象から除外し、重複実行を防いだ。
- Rust は72件成功・1件 ignore。ベンチマークのテスト実行も成功した。
- 本番ビルドは成功し、Bun の本番サーバーで5言語・実データ・クライアント Wasm・フォルダと編成の作成／名前変更／ツリー操作・数値入力・再読み込み後の永続化を確認した。未処理のブラウザエラーは0件。
- 独立レビューではサーバーの Wasm パスと ISR の翻訳設定欠落を検出し、修正した。配布ファイルだけの隔離環境で全6翻訳 namespace と5言語の再生成を確認した。
- 元の develop で本番ビルド、`verify:build`、Oxlint、型チェック、Jest、Rust を最終実行し、すべて成功した。`verify:build` は6ページの trace から2511パスを隔離して確認した。
- 最終コードの別 worktree でも frozen install と共有 Cargo キャッシュからの setup が成功した。Bun の開発サーバーで5言語、開発用実データ、Wasm、入力とツリー操作、保存復元を確認し、未処理のブラウザエラーは0件。検証用サーバーは停止済み。

## Bun test と自動回帰テストへの移行（履歴）

Jest 本体・環境パッケージ・型定義・設定を削除し、24ファイルの既存テストと追加テストを `bun:test` に移した。Bun のモジュールモックは `mock.restore()` だけでは元に戻らないため、通常のテストは `--isolate --parallel=2` で実行する。Happy DOM を preload で登録してから Testing Library と DOM matcher を読み込み、明示的な cleanup と時計・spy の復元を行う。DOM matcher のライブラリは `@testing-library/jest-dom/matchers` を利用し、Jest の実行系は使用しない。ブラウザの解析通信はユニットテストで SDK 境界を差し替える。

- Bun test は183件・24ファイルが成功した。既存162件に管理 API・ストレージ・状態の回帰18件と、編成の配置3件を追加した。
- seed 1472 のランダム実行でも183件が成功した。React StrictMode の数値入力、長押し・確定・値の制限・空入力の復元を維持した。
- 開発サーバーの Playwright 9件が成功した。5言語の初回 SSR・Wasm とメニュー切り替え、実際の艦選択と Rust の索敵計算、上下限、ツリーのキーボード操作、IndexedDB 保存後の再読み込みを検証する。
- ブラウザテストが、フォルダを選んで作成した編成がルートへ入る不具合を検出した。`createPlan` の保存先を reducer が挿入処理へ渡すように修正し、フォルダ内・同じ親の編成の直後・ルートへの追加を回帰テストで確認した。
- 本番ビルドと本番サーバーの Playwright 9件も成功した。ブラウザ例外・コンソールエラー・予期しない外部通信は0件で、検証用サーバーは停止した。
- ビルド成果物の Bun test は18件が成功した。コピーする trace の合成12件、実際の5言語再生成1件と、設定・翻訳・Wasm をコピー側から除いた3つの失敗検証、実際の Cargo Wasm metadata と過去のパス依存を再現する対照2件を含む。`verify:build` も6 manifest・2511パスの隔離環境で成功した。
- Astra xhigh の独立実行でも183件の通常・ランダム実行と、最新のビルド成果物18件がすべて成功した。
- Oxlint の型を使った解析、TypeScript、frozen install は成功した。CI に Bun test、ビルド成果物テスト、Chromium の本番 E2E を組み込んだ。

## 開発ツールの Bun 統一時の検証（履歴）

Playwright 1.63.0 は CommonJS として TypeScript のテストを読み込む際、Bun 上では JavaScript の loader を割り当てていた。テストディレクトリを ESM にし、fixture のパス解決に `import.meta.dirname` を使用して、Bun が TypeScript を直接読み込むようにした。ルート設定も `playwright.config.mts` として ESM に揃えた。

- Node.js の呼び出しを失敗させる PATH で `bun run test:e2e --list` を実行し、9件を収集した。
- 元の develop でも mise のツールインストール、frozen install、Rust テスト72件とベンチマーク、本番ビルドが成功した。Oxlint、型チェック、ユニット183件、配布検証の6 manifest・2511パス、ビルド成果物18件も成功した。
- Node.js の呼び出しを失敗させ、既存の Bun を PATH に含めない環境で、`mise exec -- bun run test:e2e` の本番9件と `mise exec -- bun run test:e2e:dev` の開発9件が成功した。preload の記録で、Playwright 本体、test worker、Next.js 本体と子プロセス、開発時の型設定確認が、すべて mise の Bun 1.4.2 であることを確認した。
- 追加の本番スモークでは、実際の艦娘と装備から敵艦へのダメージを Wasm で計算し、D3 を使う分布グラフの SVG geometry と軸の数値、装甲貫通なしの切り替えを確認した。
- 本番・開発のブラウザ例外・コンソールエラー・予期しない外部通信は0件で、検証用サーバーは停止済み。開発サーバーの色設定とページデータサイズに関する警告は残る。

## es-toolkit への置換と変換処理の整理（履歴）

ルート、admin、site、utils に es-toolkit 1.52.0 を明示し、自前ソースの Lodash import 10か所をすべて置換した。ルート・admin・site の直接依存 `lodash` とルートの `@types/lodash` は削除した。Cloudinary 2.11.0 が要求する推移依存の `lodash` 4.18.1 と、他の外部 SDK が使用する `lodash.*` は維持し、alias や override で置換していない。

用途に合わせて native API と compat API を選んだ。

- `isEqual`、`xor`、`mergeWith`、`uniq`、`uniqBy`、`sumBy` は native API を使う。共有の `groupBy` は既存の公開型を維持する薄い wrapper にした。型ガードの `includes`、継承プロパティも扱う `pick`・`mapValues` は既存の仕様を維持する。
- 動的な dot・bracket・配列パスを使うスプレッドシートと UI の `get`・`set` は compat API を使う。スプレッドシートでは、文字どおりのドットを含む見出しを優先する既存の読み取りも維持する。
- ドラッグ位置の `throttle` は同期的に直前の計算結果を返す compat API を使う。native API は `void` を返すため、この表示処理には適さない。継続した操作時の更新と結果の保持をアプリケーションの回帰テストで確認する。

native `mergeWith` は source を1つ受け取るため、翻訳マージは2回に分けた。ネットワーク取得から独立した `mergeLocaleMessages` で、空文字・単一スペース・null の取得結果が既存の非空の訳を消さない処理と、ネスト・配列のマージ、入力を変更しない性質を維持する。UI の `mergeMasterData` も純粋な関数に分離し、ID に対応する変更だけを適用して null は既定値を残す。戦闘定義の読み取りは共通処理にまとめ、欠損値は null、0 と false は実際の値として扱う。

追加した回帰テスト30件は、翻訳のフォールバックと非破壊マージ、スプレッドシートの実際のパスと batch payload、カットイン・陣形・艦の定義変換、装備名の重複とグループ化、マスターデータ上書き、ドラッグ位置の更新、解析設定のネスト更新、孤立データの削除とプリセット参照装備の保持を検証する。

ダメージグラフの開発 E2E が、同じ状態から毎回新しい配列を返す `NodeList` の React-Redux selector 警告を検出した。`shallowEqual` で選択結果を比較するように修正し、同じ警告が再発するとブラウザテストを失敗させる検証を追加した。

以下は es-toolkit への置換完了時点の検証と測定の記録。後続のリファクタリングの結果は次節に記載する。

- Node.js の呼び出しを失敗させる環境で、mise の Bun 1.4.2 による213件・32ファイル・675 assertions の通常実行と seed 1472 のランダム実行が成功した。
- Oxlint、TypeScript、本番ビルドが成功した。配布検証は6ページの manifest から2890パスを隔離し、5言語・6翻訳 namespace の再生成と Wasm の初期化に成功した。ビルド成果物テスト18件も成功した。
- 同じく Node.js の呼び出しを失敗させる環境で、修正後の本番・開発 Playwright が各10件成功した。実際の Rust 計算による通常・クリティカルのダメージ範囲と、装甲貫通なしのフィルター、有限の SVG geometry を含む D3 グラフを確認した。ブラウザ例外・コンソールエラー・予期しない外部通信・selector の不安定な結果に関する警告はすべて0件だった。Playwright、Next.js とその子プロセスは mise の Bun 1.4.2 で実行し、検証用サーバーは停止した。
- 本番 static JS の全16チャンク合計は、4,541,090 bytes から4,521,069 bytes へ減少した。`Bun.gzipSync(chunk, { level: 9 })` で圧縮した合計は1,082,634 bytes から1,074,267 bytes になった。この測定の対象は全チャンクであり、ページごとの初回ダウンロード量は測定していない。

## 追加のリファクタリング（履歴）

隔離した worktree で backend と UI を並行して整理し、各変更を独立レビューと回帰テストで確認してから統合した。ユーザー用の開発サーバー `http://localhost:3000` は停止せずに維持し、メモリを多く使う検証は順番に実行する。

- 条件式 parser の名前置換と改行・空白の正規化を共通化した。置換順、重複名の最初の一致、装備名を解釈する構文、引用符のエラー処理は維持する。
- 艦の改装サイクル判定を、再帰と繰り返し検索から ID index と反復走査に変更した。サイクルに入る手前の艦はサイクルの構成員に含めず、重複 ID の最初の一致と入力順を維持する。
- GCS 保存オプションは呼び出し元の `metadata` をコピーしてから生成する。immutable・Brotli 保存に同じオプションを再利用しても、後の通常保存に設定が漏れない。wrapper 専用のフラグを SDK に渡さず、JSON の MIME type や圧縮に対する呼び出し元の指定は維持する。
- KCNav の敵艦同期は、取得したマスターデータの艦レコードをコピーしてから更新する。比較元まで変更されてアップロードを省略する不具合を修正した。装備の比較は順序に加えて長さも確認し、装備の削除や空のリストも保存する。HP がないデータを処理しない条件と、変更のない装備の付加情報は維持する。
- 非正規化した状態の cache は参照先の entity を比較する。無関係な更新では同じ状態参照を返し、参照した艦・装備の更新や追加・削除では再計算する。
- 左右の戦闘編成で使う艦選択を共通 hook にまとめた。有効な選択は並べ替え後も維持し、選択した艦が削除された場合は編成の先頭へ戻す。ドラッグ判定は object の一致から ID の比較に変更し、ドラッグ中の名前変更後も自身や子孫への移動を拒否する。
- `useShip` は安定した状態参照を利用し、無関係な更新で Wasm の艦を作り直さない。再計算した艦の hash が同じ場合は以前の結果を再利用する。Wasm core が変わった場合は cache を作り直す。
- `AppWrapper` は取得データとユーザー設定のマージを memo 化し、両方が同じ場合は Wasm core・解析器を維持する。読み込み中、エラー、再取得後の復帰も、実際の SWR・Redux・Wasm を使ったテストで確認する。

追加した回帰テスト40件は、parser 5件、サイクル判定4件、保存オプション4件、KCNav 同期6件、参照先の cache 4件、編成の艦選択4件、ドラッグ判定3件、Wasm の艦の再利用5件、`AppWrapper` 5件。保存と同期のテストは外部 SDK と取得先を mock し、実際のマージ・差分判定と Brotli 圧縮後の保存 payload を検証する。ブラウザのマスターデータ fixture も共通化し、同じ入力で開発・本番を確認できるようにした。

統合後の独立検証では、Node.js の呼び出しを失敗させる環境で、mise の Bun 1.4.2 による Oxlint と TypeScript が成功した。ユニットテストは通常実行と seed 1472 のランダム実行の両方で、253件・40ファイル・841 assertions が成功した。React・selector・act の警告、予期しない外部通信、Node.js の呼び出しは検出されなかった。

本番ビルドも成功し、Wasm の bundler・nodejs 向け出力、utils・kcs・admin、Next.js の20ページを生成した。配布検証は6ページの manifest から2890パスを隔離し、5言語・6翻訳 namespace の再生成と Wasm の初期化を確認した。読み込んだ module も隔離先に限定され、元の node_modules を参照していない。ビルド成果物テストは18件・3ファイルすべて成功した。翻訳データによる Next.js の large-page-data 警告は引き続き残る。

最終ブラウザ検証は、隔離した本番サーバー `http://localhost:3001` で10件、既存の開発サーバー `http://localhost:3000` で10件成功した。ブラウザ例外・コンソールエラー・不安定な selector の警告・予期しない外部通信はすべて0件。Playwright 本体と test worker が mise の Bun 1.4.2 で実行されたことも確認した。検証用の本番サーバーだけを停止し、ユーザー用の開発サーバーは同じプロセスで稼働を続け、HTTP 200 を返すことを確認した。

## Rust 1.99 に合わせた追加整理

Rust 1.99 向けの追加整理では、直接依存32種類を公式 crates.io index と照合し、すべて最新安定版であることを確認した。`once_cell` は標準の `LazyLock` へ移し、JavaScript 変換は Tsify に統一して `gloo-utils` の直接依存も削除した。残る直接依存は30種類。推移依存の `minicov` は wasm-bindgen-test が要求する固定版を維持する。

早期終了を `let-else` に統一し、serde_with と thiserror の derive で結果・エラーの実装を集約した。ArrayVec の切り詰めと hashbrown の `entry_ref` を使用し、不要な再収集・重複検索を減らした。ネイティブの装備ボーナス計算は子プロセスの終了コードを確認し、Rust 1.99 の `String::from_utf8_lossy_owned` で失敗時の標準エラーを表示する。[Rust 1.99 の変更点](https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/)

Rust テスト79件が成功し、既存の1件は ignore を維持した。bench のテスト実行、ホストと Wasm の Clippy、rustfmt、両形式の Wasm ビルド、metadata 検証2件も成功した。再生成した公開 TypeScript 型は完全一致。JavaScript から艦5条件・攻撃解析6組・防空2計算を旧 Wasm と比較し、能力値・装備ボーナス・防空値は一致、確率値の差は最大約 `2.2e-16` だった。確率値は絶対誤差 `1e-12` 以内、その他は完全一致として確認した。この変更は `fleethub-core@1.12.21` として npm の `latest` タグへ公開した。公開アーカイブを独立した環境へインストールし、override なしで equipment-bonus 7.13.26 と 7.13.30 の両方について依存の共有と両形式の Wasm の動作を確認した。

## 現行の再現用コマンド

Bun 1.4.2 を PATH に用意し、リポジトリルートから実行する。mise を使う場合は `mise trust` と `mise install --locked bun` を実行して shell activation を設定する。次のサイト検証に Rust と wasm-pack は不要。

```sh
bun install --frozen-lockfile
bun run setup
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
bun run verify:build
bun run test:build
bun run playwright install --with-deps chromium
bun run test:e2e
E2E_WORKERS=1 bun run test:e2e:dev
bun run dev
```

既存の開発サーバーを再起動せずに検証する場合は、`E2E_BASE_URL=http://localhost:3000 E2E_MODE=dev E2E_WORKERS=1 bun run test:e2e` を使う。`E2E_BASE_URL` を指定すると Playwright はサーバーを起動・停止しない。

分析結果だけを保存する場合は次を実行する。

```sh
bun run --cwd packages/site analyze --output
```

Rust コアの開発・公開用検証は別に実行する。Rust のネイティブテストも、装備ボーナスの JavaScript 計算に Bun を使用する。

```sh
mise trust
mise install --locked bun rust github:wasm-bindgen/wasm-pack
mise exec -- bun install --frozen-lockfile
mise exec -- cargo fmt --all -- --check
mise exec -- cargo clippy --workspace --all-targets --locked -- -D warnings
mise exec -- cargo test --workspace --all-targets --locked
mise exec -- bun run build:core
mise exec -- bun run test:core
```

`build` は setup を含む。`lint`、型チェック、ユニットテストの前には setup が必要。Wasm 最適化、型チェック、DOM テスト、Next.js 開発サーバーはメモリを多く使うため、メモリが限られる環境では同時実行を避ける。ブラウザの workers は `E2E_WORKERS` で調整できる。

ビルドと配布成果物検証は公開 GCS データを読み取るため、ネットワーク接続が必要。ブラウザ検証の標準 URL は `http://localhost:3000`。ブラウザのマスターデータ要求には fixture を返すため、`E2E_BASE_URL` で別ポートの検証用サーバーも指定できる。JavaScript・翻訳・Wasm は Next.js の実際の配信を使う。配布成果物検証は実際の再生成関数を確認し、ホスティングサービスの HTTP キャッシュ機構は検証しない。デプロイと外部データの更新はこの移行に含めない。
