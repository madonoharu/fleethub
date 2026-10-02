const nextJest = require(
  require.resolve("next/jest", {
    paths: [require("path").join(__dirname, "packages/site")],
  }),
);

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./packages/site",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  watchPathIgnorePatterns: "/target/debug/",
  testPathIgnorePatterns: [
    "<rootDir>/tests/(?:e2e|build)/",
    "<rootDir>/target/",
    "<rootDir>/packages/[^/]+/(?:esm|lib|cjs|dist)/",
    "<rootDir>/crates/[^/]+/(?:pkg|node)/",
  ],
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

// https://github.com/vercel/next.js/discussions/34589
module.exports = async () => {
  const nextJestConfig = await createJestConfig(customJestConfig)();

  const esmPatterns = [
    "got",
    "p-cancelable",
    "@szmarczak/http-timer",
    "lowercase-keys",
  ];

  return {
    ...nextJestConfig,
    transformIgnorePatterns: [
      `/node_modules/(?!(${esmPatterns.join("|")})/)`,
      ...nextJestConfig.transformIgnorePatterns.filter(
        (pattern) => pattern !== "/node_modules/",
      ),
    ],
  };
};
