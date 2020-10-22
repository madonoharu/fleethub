/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const WebpackBar = require("webpackbar")

const package = require("./package.json")

/** @type import('webpack').RuleSetRule */
const rules = [
  {
    test: /\.(j|t)sx?$/,
    exclude: /(node_modules|bower_components)/,
    use: {
      loader: "babel-loader",
      options: {
        presets: [
          [
            "@babel/preset-env",
            {
              useBuiltIns: "usage",
              corejs: { version: 3, proposals: false },
            },
          ],
          "@babel/preset-react",
          "@babel/preset-typescript",
        ],
      },
    },
  },
  {
    test: /\.(gif|png|jpe?g|svg|webp|ico|woff|woff2)$/,
    type: "asset/resource",
  },
  {
    test: /\.html$/,
    loader: "html-loader",
  },
]

/** @type import('webpack').Configuration */
const config = {
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(process.cwd() + "../../../public"),
    assetModuleFilename: "images/[hash][ext]",
  },
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"],
  },
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },

  plugins: [
    new WebpackBar(),
    new HtmlWebpackPlugin({
      title: "作戦室 Jervis OR",
      template: "./src/index.html",
      favicon: "./src/favicon.ico",
    }),
    new webpack.DefinePlugin({
      "process.env.VERSION": JSON.stringify(package.version),
    }),
  ],

  devServer: {
    clientLogLevel: "warning",
    contentBase: path.resolve(__dirname, "dist"),
    port: 8000,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    },
  },
}

module.exports = config
