# @fh/site

艦隊編成・戦闘分析を行う Next.js アプリです。Pages Router、React、MUI と npm 配布済みの `fleethub-core` Wasm を使用します。

開発はリポジトリルートから開始します。Bun 1.4.2 を PATH に用意してください。Rust と wasm-pack はサイトの開発・ビルドには不要です。mise を使う場合の Bun の準備については [ルートの README](../../README.md) を参照してください。

```sh
bun install --frozen-lockfile
bun run setup
bun run dev
```

開発サーバーは [http://localhost:3000](http://localhost:3000) で起動します。画面は `src/pages`、共通 UI は `src/components`、翻訳は `public/locales` にあります。

## UI スタイル

操作部品は MUI 9、アプリ固有のレイアウト・装飾は Tailwind CSS 4 を使用します。
`src/styles/globals.css` に色、MUI と同じブレークポイント、共通ユーティリティを定義し、
`postcss.config.mjs` の `@tailwindcss/postcss` で生成します。リセットは MUI の
`CssBaseline` に統一し、Tailwind の Preflight は読み込みません。

[MUI 公式の Pages Router 連携](https://mui.com/material-ui/integrations/tailwindcss/tailwindcss-v4/#nextjs-pages-router)
に従い、`@mui/material-nextjs/v16-pagesRouter` の共有キャッシュに
`enableCssLayer: true` を設定しています。SSR とクライアントで
`theme, base, mui, components, utilities` の順序を宣言し、Tailwind の指定を MUI より優先します。
`AppCacheProvider`、`documentGetInitialProps`、`DocumentHeadTags` で SSR と hydration を連携します。Emotion は MUI の描画・SSR 用に維持します。

独自スタイルは `className` に記述し、呼び出し元のクラスを受け取る部品では
`src/styles/cn.ts` の `cn` で統合してください。Tailwind の間隔は 4px 単位です
（旧 MUI の `sx={{ gap: 1 }}` は `gap-2`）。データ由来の座標・色などは
`style` または CSS カスタムプロパティで渡します。

UI の変更は、通常表示だけでなくホバー時の操作ボタン・ツールチップ、ダイアログ、
キーボード操作も確認してください。ブラウザ回帰テストの手順は
[tests/e2e/README.md](../../tests/e2e/README.md) を参照してください。

```sh
bun run build
bun run start
```

Next.js は Bun のランタイムで実行し、本番ビルドには Turbopack を使用します。Bun と Turbopack の組み合わせで dev が動的生成した外部依存のリンクを読み込めない問題が再現したため、dev のみ Webpack を維持します（[同型の Bun issue](https://github.com/oven-sh/bun/issues/25370)）。本番のビルド・ISR・Wasm と開発時のブラウザ操作はそれぞれ検証します。

`packages/site` 内で `bun run build` を実行した場合も、ルートの `setup` で必要な JavaScript ワークスペースをビルドします。Wasm は npm パッケージ内の生成済みファイルをバンドルします。

バンドル解析には `packages/site` で `bun run analyze` を実行します。Next.js 内蔵の `experimental-analyze` を使い、`bun run analyze --output` なら `.next/diagnostics/analyze` に静的レポートを保存できます。

Vercel の Root Directory は `packages/site` に設定し、[vercel.json](vercel.json) の Bun 用インストール・ビルド設定を使用します。ホスティングで Rust と wasm-pack を用意する必要はありません。Rust コアの開発・公開手順は [コアの README](../../crates/fleethub-core/README.md) を参照してください。
