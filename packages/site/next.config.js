const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const withTM = require("next-transpile-modules")([]);
const { i18n } = require("./next-i18next.config");

const config = {
  env: {
    VERSION: require("./package.json").version,
  },
  i18n,
  localePath: "./public/locales",

  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/sync",
    });

    config.experiments = {
      syncWebAssembly: true,
    };

    config.output.webassemblyModuleFilename =
      (isServer ? "../" : "") + "static/wasm/webassembly.wasm";

    if (process.env.ANALYZE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: isServer
            ? "../analyze/server.html"
            : "./analyze/client.html",
        })
      );
    }
    return config;
  },
};

module.exports = withTM(config);
