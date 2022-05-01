const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./packages/site",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  watchPathIgnorePatterns: "/target/debug/",
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
        (pattern) => pattern !== "/node_modules/"
      ),
    ],
  };
};
