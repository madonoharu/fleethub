const path = require("path");
const fs = require("fs");
const { i18n } = require("./next-i18next.config");

const CORE_VERSION = require(
  path.join(require.resolve("fleethub-core"), "../../package.json"),
).version;

/** @type {import("next").NextConfig} */
const config = {
  env: {
    KCS_SCRIPT: fs.readFileSync(require.resolve("../kcs/lib/index.js")).toString(),
    SITE_VERSION: `${require("./package.json").version}`,
    CORE_VERSION,
    MASTER_DATA_PATH:
      process.env.NODE_ENV === "development"
        ? "data/master_data.dev.json"
        : "data/master_data.json",
  },
  i18n,
  reactStrictMode: true,
  // Bundle MUI's document helpers with Next's page runtime so ISR does not
  // load raw next/document with untraced vendored contexts.
  transpilePackages: ["ts-norm", "@mui/material-nextjs"],

  // Keep the npm package's CommonJS wrapper next to its Wasm at runtime.
  serverExternalPackages: ["fleethub-core"],

  outputFileTracingRoot: path.resolve(__dirname, "../.."),

  // next-i18next の翻訳 JSON と設定は動的パスで読まれ、nft が追跡できない。
  // ISR の再生成は Serverless Function 内で getStaticProps を再実行するので、
  // 明示的に同梱しないと翻訳が空になりキー(英語)がそのまま表示される。
  outputFileTracingIncludes: {
    "/": ["./public/locales/**", "./next-i18next.config.js"],
  },

  images: {
    minimumCacheTTL: 2678400,
    qualities: [75],
  },

  // gkcoi's Flat theme hardcodes /static URLs; its published assets omit
  // that prefix and are not included in the npm package.
  rewrites() {
    return ["fonts", "flat"].map((directory) => ({
      source: `/static/${directory}/:path*`,
      destination: `https://gkcoi.vercel.app/${directory}/:path*`,
    }));
  },

  // Bun currently fails to resolve Turbopack's external aliases created during
  // dev (oven-sh/bun#25370). Production uses Turbopack; dev keeps Webpack.
  webpack: (config, { isServer }) => {
    config.experiments.asyncWebAssembly = true;
    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }
    return config;
  },

  async headers() {
    return [
      {
        source: "/:all*.wasm",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.ico",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

module.exports = config;
