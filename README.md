# fleethub

[![GitHub deployments](https://img.shields.io/github/deployments/madonoharu/fleethub/production?label=vercel&logo=Vercel&logoColor=white)](https://jervis.vercel.app)
[![npm](https://img.shields.io/npm/v/fleethub-core)](https://www.npmjs.com/package/fleethub-core)

データはスプレッドシートから編集できます。  
[作戦室データ管理シート](https://docs.google.com/spreadsheets/d/1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA)

# Developing

依存関係をインストールする前に、[Rust](https://www.rust-lang.org/tools/install)、`wasm-pack`、`jq` を用意してください。インストール時にワークスペース内の Wasm もビルドします。CI やホスティング環境でも、`yarn install` の前にこれらのツールが必要です。

```sh
cargo install wasm-pack --version 0.15.0 --locked
```

1. このリポジトリを自分の GitHub アカウントに[fork](https://help.github.com/articles/fork-a-repo/)してから、
   ローカルに[clone](https://help.github.com/articles/cloning-a-repository/)してください。
2. branch を作成
   ```
   git checkout -b MY_BRANCH_NAME
   ```
3. yarn をインストール
   ```
   npm install -g yarn
   ```
4. yarn で依存関係をインストールします
   ```
   yarn
   ```
5. watch モードで開発を開始します
   ```
   yarn dev
   ```

アプリのビルドには Rust と [wasm-pack](https://rustwasm.github.io/wasm-pack/) が必要です。

Rust は `rust-toolchain.toml` で 1.99.0 に固定しています。Rustup が必要なコンポーネントと `wasm32-unknown-unknown` ターゲットを自動的にインストールします。`wasm-pack` は 0.15.0 以降、Node.js は 19 以降を使用してください。

```sh
cargo test --workspace --all-targets --locked
yarn build:core
```

Rust のテストビルドでは、最新のマスターデータを取得するためネットワーク接続が必要です。

アプリはワークスペース内の `crates/fleethub-core` を参照します。Rust の変更後は `yarn build:core` を実行してから `yarn dev` を起動してください。`yarn build:site` は Wasm を再ビルドしてからアプリをビルドします。
