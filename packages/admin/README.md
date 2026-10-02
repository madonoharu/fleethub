# @fh/admin

Firebase、Google Sheets、Cloudinary を使うデータ管理用パッケージです。ルートの更新スクリプトと API workflow から使用します。

リポジトリルートで依存関係とワークスペースを準備します。

```sh
bun install --frozen-lockfile
bun run setup
```

管理用パッケージだけを再ビルドする場合は `bun run build:admin` を実行します。共有ユーティリティや Wasm も変更した場合は `bun run setup` を実行してください。

データ更新スクリプトが使用する認証情報は、ルートの `.env` または CI secrets に設定します。利用するサービスの設定は `src` の各実装を参照してください。
