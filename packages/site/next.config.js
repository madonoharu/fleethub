const fs = require("fs");
const { i18n } = require("./next-i18next.config");
const withTM = require("next-transpile-modules")(["ts-norm"]);
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// https://github.com/vercel/next.js/issues/29362#issuecomment-971377869
class WasmChunksFixPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("WasmChunksFixPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: "WasmChunksFixPlugin" },
        (assets) =>
          Object.entries(assets).forEach(([pathname, source]) => {
            if (!pathname.match(/\.wasm$/)) return;
            compilation.deleteAsset(pathname);

            const name = pathname.split("/")[1];
            const info = compilation.assetsInfo.get(pathname);
            compilation.emitAsset(name, source, info);
          })
      );
    });
  }
}

/** @type {import("next").NextConfig} */
const config = {
  env: {
    KCS_SCRIPT: fs
      .readFileSync(require.resolve("../kcs/lib/index.js"))
      .toString(),
    VERSION: `${require("./package.json").version}`,
  },
  i18n,

  reactStrictMode: true,

  experimental: {
    // https://github.com/vercel/next.js/issues/30425
    esmExternals: false,
  },

  webpack: (config, { isServer, dev }) => {
    config.experiments.asyncWebAssembly = true;

    // https://github.com/react-dnd/react-dnd/issues/3416
    config.resolve.alias["react/jsx-runtime.js"] = "react/jsx-runtime";
    config.resolve.alias["react/jsx-dev-runtime.js"] = "react/jsx-dev-runtime";

    if (!dev && isServer) {
      config.output.webassemblyModuleFilename = "chunks/[id].wasm";
      config.plugins.push(new WasmChunksFixPlugin());
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
    ];
  },
};

module.exports = withBundleAnalyzer(withTM(config));
