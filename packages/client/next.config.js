/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")
const WebpackBar = require("webpackbar")

const config = {
  env: {
    VERSION: require("./package.json").version,
  },
  webpack: (config, options) => {
    if (process.env.NODE_ENV === "development") {
      config.plugins.push(new WebpackBar())
    }

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

module.exports = config
