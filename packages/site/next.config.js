const { i18n } = require("./next-i18next.config");

/**
 * @type import("next").NextConfig
 */
const config = {
  env: {
    VERSION: require("./package.json").version,
  },
  i18n,
  localePath: "./public/locales",

  webpack: (config, { isServer }) => {
    config.experiments.asyncWebAssembly = true;
    config.output.webassemblyModuleFilename =
      (isServer ? "../" : "./") + "static/wasm/webassembly.wasm";

    return config;
  },
};

module.exports = config;
