# fleethub

[![GitHub deployments](https://img.shields.io/github/deployments/madonoharu/fleethub/production?label=vercel&logo=Vercel&logoColor=white)](https://jervis.vercel.app)
[![npm](https://img.shields.io/npm/v/fleethub-core)](https://www.npmjs.com/package/fleethub-core)

データはスプレッドシートから編集できます。  
[作戦室データ管理シート](https://docs.google.com/spreadsheets/d/1IQRy3OyMToqqkopCkQY9zoWW-Snf7OjdrALqwciyyRA)

# Developing

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

Rust のコードを開発する場合、[Rust のインストール](https://www.rust-lang.org/tools/install) と [wasm-pack](https://rustwasm.github.io/wasm-pack/) が必要です。
