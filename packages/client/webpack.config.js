/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const WebpackBar = require("webpackbar")

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
    test: /\.(gif|png|jpe?g|svg|woff|woff2|eot|ttf)$/,
    use: [
      {
        loader: "url-loader",
        options: {
          limit: 244,
          name: "static/media/[path][name].[ext]",
          esModule: false,
        },
      },
    ],
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
    path: path.resolve(process.cwd() + "/dist"),
  },
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json"],
  },

  plugins: [
    new WebpackBar(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
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
