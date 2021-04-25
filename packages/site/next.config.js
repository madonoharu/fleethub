/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const { i18n } = require("./next-i18next.config");

const config = {
  future: {
    webpack5: true,
  },
  env: {
    VERSION: require("./package.json").version,
  },
  i18n,
  localePath: "./public/locales",
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/sync",
    });

    config.experiments = {
      syncWebAssembly: true,
    };

    if (process.env.ANALYZE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: options.isServer
            ? "../analyze/server.html"
            : "./analyze/client.html",
        })
      );
    }
    return config;
  },
};

module.exports = config;
