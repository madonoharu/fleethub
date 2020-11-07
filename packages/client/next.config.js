/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")
const WebpackBar = require("webpackbar")

module.exports = {
  env: {
    VERSION: require("./package.json").version,
  },
  webpack: (config, options) => {
    config.plugins.push(new WebpackBar())

    if (process.env.ANALYZE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: options.isServer ? "../analyze/server.html" : "./analyze/client.html",
        })
      )
    }
    return config
  },
}
