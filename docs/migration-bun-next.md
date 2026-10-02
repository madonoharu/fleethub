# Bun と Next.js の移行計画

2026年10月2日時点の npm レジストリの安定版を基準に、Yarn 4、Next.js 15、React 18 のワークスペースを Bun 1.4.2、Next.js 16.3.8、React 19.3.0 に移行する。lint は Oxlint、型チェックは TypeScript、既存の DOM テストは Jest を使用する。

## 実施順序

1. 独立した worktree で変更を検証し、既存テストの結果を基準として記録する。
2. Yarn の設定とロックファイルを Bun に置き換える。インストールと Rust/Wasm を含むワークスペースビルドを分離し、生成物を依存順に作る。
3. npm の直接依存を最新安定版へ更新する。暗黙の推移依存を明示し、未使用の開発ツールを削除する。
4. React 19、MUI 9、Tree View 9、Recharts 3、next-i18next 16 の破壊的変更に対応する。既存の翻訳、ISR、状態永続化、Wasm 計算を維持する。
5. CI と開発手順を更新する。frozen install、Oxlint、型チェック、Jest、Rust テスト、本番ビルド、HTTP とブラウザの確認を行う。
6. 検証済み変更を元の作業ブランチに反映し、再現用コマンドと残る制約を記録する。

## 方針

既存アプリは Pages Router で、翻訳の事前生成と ISR、Emotion の Document 処理を使用している。この移行では Pages Router を継続する。next-i18next の Pages 用 API は `next-i18next/pages` に変更する。

Wasm は Webpack の async WebAssembly と出力パス補正を必要とするため、開発・本番とも `--webpack` を明示する。Turbopack は独立した実験で適合性を確認してから採用できる。Next.js 16 は標準で Turbopack を使うため、この指定が必要になる。[Next.js の移行ガイド](https://nextjs.org/docs/app/guides/upgrading/version-16)

Next.js の起動には `bun --bun next` を使用し、Bun をパッケージマネージャーとアプリ実行環境にする。Jest は既存の Next.js/SWC/jsdom テスト基盤を維持して Node.js で実行する。[Bun の Next.js ガイド](https://bun.sh/guides/ecosystem/nextjs)

インストール時の重い Wasm ビルドは明示的な `bun run setup` に移す。`bun run build` は setup を含み、クリーンな checkout からビルドできる。公開や外部データの更新は検証に含めない。

## 検証記録

移行前の Jest は 18 suite、157 test が成功した。移行後の実行結果と確認した制約は、検証完了時に追記する。

## WSL 再起動前の保存状況

ユーザーの指示により、2026年10月2日に進行中の検証を停止して保存した。移行用ブランチは `migration/bun-next`、worktree は `/home/hal/dev/fleethub-migrate`。元の `/home/hal/dev/fleethub` の `develop` への反映は最終検証後に行う。

保存済みの変更は Bun ロックファイル、最新 npm 依存、Oxlint、TypeScript 7、Next.js 16、React 19、MUI 9、Recharts 3、翻訳 API、Firebase Admin、CI と開発文書。UI の対象テスト 47 件と管理処理の回帰テスト 3 件が成功した。Wasm の bundler/nodejs 両方のビルドと utils/kcs のビルドも成功した。

admin の最終 setup では追加されたテストの型がビルド対象に入っていたため、テストを emit 対象から除外した。Next.js 用 tsconfig にもテストの型を明示した。これらの最終設定変更は再起動後に検証する。

Rust テストは停止直前に完了し、成功した。残る作業は frozen install、setup、全体の Oxlint と型チェック、Jest 全体、本番 Next.js ビルド、Bun サーバーと全言語のブラウザ確認、元ブランチへの反映。React Compiler は使用していないため、Oxlint の React Compiler 専用規則を無効化し、従来の Hooks 規則と型に基づく規則を適用する。

再開時のコマンド:

```sh
cd /home/hal/dev/fleethub-migrate
export PATH="$HOME/.bun/bin:$PATH"
bun install --frozen-lockfile
CARGO_TARGET_DIR=/home/hal/dev/fleethub/target bun run setup
bun run lint
bun run typecheck
bun run test --runInBand
CARGO_TARGET_DIR=/home/hal/dev/fleethub/target cargo test --workspace --all-targets --locked
NEXT_TELEMETRY_DISABLED=1 CARGO_TARGET_DIR=/home/hal/dev/fleethub/target bun run build
```

WSL は Windows ホストの全 12 論理 CPU を使用でき、CPU quota にも制限がない。再起動前に Windows の `.wslconfig` に `processors=12` を明示する。メモリ 10GB と swap 0 の既存設定は維持する。
